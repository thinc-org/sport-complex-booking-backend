import { CuStudentUser, SatitCuPersonelUser } from "src/users/interfaces/user.interface"
import {
  Body,
  Controller,
  Post,
  Put,
  Res,
  HttpService,
  HttpException,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
  ClassSerializerInterceptor,
  UseInterceptors,
  HttpStatus,
  UploadedFiles,
  Get,
} from "@nestjs/common"
import { UsersService } from "./users.service"
import { UserGuard } from "src/auth/jwt.guard"
import { AuthService } from "src/auth/auth.service"
import { LoginUserDto } from "./dto/login-user.dto"
import { map, catchError } from "rxjs/operators"
import { ConfigService } from "@nestjs/config"
import { ChangeLanguageDto } from "./dto/change-language.dto"
import { AppticketDTO, CUStudentDTO, SSOValidationResult, LoginSuccessDTO, SSOValidationUpdateInfoDTO, UserDTO, FormDataDTO } from "./dto/user.dto"
import { Role } from "src/common/roles"
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger"
import { FSController } from "src/fs/fs.controller"
import { FileFieldsInterceptor } from "@nestjs/platform-express"
import { FSService } from "src/fs/fs.service"
import { validate, ValidationError } from "class-validator"
import { plainToClass } from "class-transformer"
import { UploadedFilesOther, UploadedFilesSatit } from "src/fs/fs.interface"

@ApiTags("users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private authService: AuthService,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly fsService: FSService
  ) {}

  @ApiCreatedResponse({
    description: "Login successfully",
    type: LoginSuccessDTO,
  })
  @ApiBadRequestResponse({ description: "Username or Password is wrong" })
  @UsePipes(new ValidationPipe())
  @Post("/login")
  async login(@Body() loginUserDto: LoginUserDto, @Res() res): Promise<string> {
    const user = await this.userService.login(loginUserDto.username, loginUserDto.password)
    return res.status(201).json({
      statusCode: 201,
      message: "Login successfully",
      jwt: this.authService.generateJWT(user["_id"], "User"),
      is_thai_language: user["is_thai_language"],
    })
  }

  @ApiOkResponse({
    description: "User created",
    type: SSOValidationResult,
  })
  @ApiUnauthorizedResponse({
    description: "Incorrect appticket.",
  })
  @Post("validation") //takes {"appticket": <ticket>} from front-end as body
  async authenticateUser(@Body() appticket: AppticketDTO): Promise<any> {
    const params = JSON.stringify(appticket)
    const res = this.httpService
      .post(this.configService.get("ssoEndpoint_VALIDATE"), params, {
        headers: {
          DeeAppId: this.configService.get("DeeAppId"),
          DeeAppSecret: this.configService.get("DeeAppSecret"),
          DeeTicket: appticket["appticket"],
        },
      })
      .pipe(
        catchError((e) => {
          throw new HttpException(e.response.data, e.response.status)
        })
      )
      .pipe(
        map(async (res) => {
          let acc
          const db_acc = await this.userService.findByUsername(res.data["username"])

          if (db_acc == null) {
            //no doc in db (register)
            acc = await this.userService.create_fromSso(res.data) //return db's object id
          } else {
            //there is doc in db (login)
            acc = db_acc
          }
          const payload = {
            token: this.authService.generateJWT(acc["_id"], "User"),
            is_first_login: acc["is_first_login"],
            is_thai_language: acc["is_thai_language"],
          }
          return payload
        })
      )
    return res //return payload
  }

  @ApiOkResponse({
    description: "Created the user",
  })
  @ApiBadRequestResponse({
    description: "Username/Email is already used",
  })
  @ApiInternalServerErrorResponse({
    description: "Can't create user ( likely caused by insufficient write permission )",
  })
  @ApiBadRequestResponse({
    description: "Some user data is invalid",
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @UsePipes(ValidationPipe)
  @Post("other")
  @UseInterceptors(FileFieldsInterceptor(FSController.fileUploadConfig, { limits: { fileSize: FSController.maxFileSize } }))
  async createOtherUser(@UploadedFiles() files: UploadedFilesOther, @Body() body: FormDataDTO) {
    const validatedUser = await this.userService.validateOtherUserData(body.data)
    const [createdUser, jwt] = await this.userService.createOtherUser(validatedUser)
    await this.fsService.saveFiles(this.configService.get("UPLOAD_DEST"), createdUser._id, files)
    return {
      statusCode: 201,
      message: "OtherUser created Successfully",
      jwt: jwt,
    }
  }

  @ApiBadRequestResponse({ description: "The given username is used" })
  @ApiCreatedResponse({ description: "Created satit user" })
  @Post("/satit")
  @UseInterceptors(FileFieldsInterceptor(FSController.fileUploadConfigSatit, { limits: { fileSize: FSController.maxFileSize } }))
  @UsePipes(new ValidationPipe({ transform: true }))
  async createSatitUser(@UploadedFiles() files: UploadedFilesSatit, @Body() body: FormDataDTO, @Res() res) {
    const validatedUser = await this.userService.validateSatitUserData(body.data)
    const [createdUser, jwt] = await this.userService.createSatitUser(validatedUser)
    await this.fsService.saveFilesSatit(this.configService.get("UPLOAD_DEST"), createdUser._id, files)
    return res.status(201).json({
      statusCode: 201,
      message: "SatitUser created Successfully",
      jwt: jwt,
    })
  }

  @UseGuards(UserGuard)
  @ApiOkResponse({
    description: "User updated.",
    type: CUStudentDTO,
  })
  @ApiBadRequestResponse({
    description: "This email is already exists or invalid Id",
  })
  @ApiNotFoundResponse({ description: "Cannot find user." })
  @Put("validation")
  async changeDBInfo(@Body() input: SSOValidationUpdateInfoDTO, @Req() req): Promise<CuStudentUser> {
    //recieve username (for query), is_thai_language, personal_email, phone
    const acc = this.userService.changeData(input, req.user.userId)
    return acc
  }

  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: "Invalid Id" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiCreatedResponse({ description: "Change language already" })
  @UseGuards(UserGuard)
  @Put("changeLanguage")
  async changeLanguage(@Req() req, @Body() changeLanguageDto: ChangeLanguageDto, @Res() res) {
    await this.userService.changeLanguage(changeLanguageDto.is_thai_language, req.user.userId)
    return res.status(201).json({
      statusCode: 201,
      message: "Change language already",
    })
  }
}
