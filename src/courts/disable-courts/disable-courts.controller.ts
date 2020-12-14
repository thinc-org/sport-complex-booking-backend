import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CreateDisableCourtDTO } from './disable-courts.dto';
import { DisableCourtsService } from './disable-courts.service';
import { DisableCourt } from './interfaces/disable-courts.interface';

@Controller('courts/disable-courts')
export class DisableCourtsController {
    constructor(private readonly disableCourtsService: DisableCourtsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('')
    async createDisableCourt(@Req() req, @Body() body: CreateDisableCourtDTO, @Query('merge') merge: boolean): Promise<DisableCourt> {
        if (!req.user.isStaff) throw new HttpException("Not a Staff", HttpStatus.UNAUTHORIZED);
        return await this.disableCourtsService.createDisableCourt(body, merge);
    }

    @Get('')
    async getAllDisableCourt(@Req() req): Promise<DisableCourt[]> {
        return await this.disableCourtsService.getAllDisableCourt();
    }

    @Get('closed_time')
    async getClosedTime(@Req() req, @Query('sport_name') sport_name: string, @Query('court_num') court_num: number, @Query('date') dateString: string): Promise<Array<[number, number]>> {
        return await this.disableCourtsService.findClosedTimes(sport_name, court_num, new Date(dateString));
    }

    @Get(':id')
    async getDisableCourt(@Req() req, @Param('id') id: string): Promise<DisableCourt> {
        return await this.disableCourtsService.getDisableCourt(id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('')
    async deleteAllDisableCourt(@Req() req): Promise<void> {
        if (!req.user.isStaff) throw new HttpException("Not a Staff", HttpStatus.UNAUTHORIZED);
        await this.disableCourtsService.deleteAllDisableCourt();
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteDisableCourt(@Req() req, @Param('id') id: string): Promise<void> {
        if (!req.user.isStaff) throw new HttpException("Not a Staff", HttpStatus.UNAUTHORIZED);
        await this.disableCourtsService.deleteDisableCourt(id);
    }

}