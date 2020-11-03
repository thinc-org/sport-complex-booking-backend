import { Controller, Get, Res, Post, Param, UploadedFile, UploadedFiles, UseInterceptors, UseGuards, Req, Put, Query, HttpException, HttpStatus } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { FSService } from './fs.service';

import { AccountInfosService } from 'src/accountInfos/accountInfos.service';

@Controller('fs')
export class FSController {

  constructor(private readonly fsService: FSService, private readonly accountInfoService: AccountInfosService) { }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'user_photo', maxCount: 1 },
    { name: 'medical_certificate', maxCount: 1 },
    { name: 'national_id_photo', maxCount: 1 },
    { name: 'house_registration_number', maxCount: 1 },
    { name: 'relationship_verification_document', maxCount: 1 },
  ]))
  async uploadFile(@UploadedFiles() files, @Req() req) {
    const user = await this.accountInfoService.getAccountInfo(req.user.userId)
    if(user==null){
      throw new HttpException('cannot find user: '+req.use.userId,HttpStatus.NOT_FOUND)
    }
    return this.fsService.saveFiles('../uploads/',req.user.userId, files)
  }

  @Get('/view')
  async viewFile(@Req() req, @Res() res, @Query('token') token: string) {
    if(!token) throw new HttpException('No token', HttpStatus.FORBIDDEN)

    try{
      const fileId = this.fsService.extractFileId(token)
      const fileInfo = await this.fsService.getFileInfo(fileId)
      res.sendFile('uploads/' + fileInfo._id + fileInfo.ext, { root: '../' });
    }
    catch(err){
      throw new HttpException(err.name, HttpStatus.UNAUTHORIZED);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:fileId/viewFileToken')
  async viewFileToken(@Req() req,@Res() res, @Param('fileId') fileId: string ){
    const fileInfo = await this.fsService.getFileInfo(fileId)
    if (!req.user.isAdmin && fileInfo.owner != req.user.userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    } else {
      res.send({token: this.fsService.generateViewFileToken(fileId)})
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('admin/upload/:userId')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'user_photo', maxCount: 1 },
    { name: 'medical_certificate', maxCount: 1 },
    { name: 'national_id_photo', maxCount: 1 },
    { name: 'house_registration_number', maxCount: 1 },
    { name: 'relationship_verification_document', maxCount: 1 },
  ]))
  async uploadFileAdmin(@UploadedFiles() files, @Req() req, @Res() res, @Param('userId') userId: string) {
    if (!req.user.isAdmin) {
      res.status(401).send('Unauthorized')
      return
    }
    const user = await this.accountInfoService.getAccountInfo(userId)
    if(user==null){
      throw new HttpException('cannot find user: '+req.use.userId,HttpStatus.NOT_FOUND)
    }
    res.send(await this.fsService.saveFiles('../uploads/',userId, files))
  }

}