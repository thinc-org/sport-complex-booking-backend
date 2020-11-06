import { Controller, Get, Res, Post, Param, UploadedFile, UploadedFiles, UseInterceptors, UseGuards, Req, Put, Query, HttpException, HttpStatus, Body, Delete } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { FSService } from './fs.service';

import { AccountInfosService } from 'src/users/accountInfos/accountInfos.service';
import { ConfigService } from '@nestjs/config';

@Controller('fs')
export class FSController {

  constructor(private readonly fsService: FSService, private readonly configService: ConfigService) { }

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
    const eligible = await this.fsService.verifyUserEligibility(req.user.userId)
    if (!eligible) throw new HttpException('This user cannot upload', HttpStatus.FORBIDDEN)
    return this.fsService.saveFiles(this.configService.get('UPLOAD_DEST'), req.user.userId, files)
  }

  @Get('/view')
  async viewFile(@Req() req, @Res() res, @Query('token') token: string) {
    if (!token) throw new HttpException('No token', HttpStatus.FORBIDDEN)
    const fileId = this.fsService.extractFileId(token)
    const fileInfo = await this.fsService.getFileInfo(fileId)
    res.sendFile(fileInfo.full_path);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/viewFileToken/:fileId')
  async viewFileToken(@Req() req, @Res() res, @Param('fileId') fileId: string) {
    const fileInfo = await this.fsService.getFileInfo(fileId)
    if (!req.user.isAdmin && fileInfo.owner != req.user.userId) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    } else {
      res.send({ token: this.fsService.generateViewFileToken(fileId) })
    }
  }


  @UseGuards(JwtAuthGuard)
  @Delete('admin/delete/:fileId')
  async deleteFileAdmin(@Req() req, @Param('fileId') fileId: string) {
    if (!req.user.isAdmin) throw new HttpException('Not an admin', HttpStatus.UNAUTHORIZED)
    const fileInfo = await this.fsService.getFileInfo(fileId)
    await this.fsService.deleteFile(fileInfo.full_path, fileInfo._id)
    return fileInfo
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
    if (!req.user.isAdmin) throw new HttpException('Not an admin', HttpStatus.UNAUTHORIZED)
    res.send(await this.fsService.saveFiles(this.configService.get('UPLOAD_DEST'), userId, files))
  }


}