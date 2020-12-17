import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { AddDisableTimeDTO, CreateDisableCourtDTO, EditDisableCourtDTO } from './disable-courts.dto';
import { DisableCourtsService } from './disable-courts.service';
import { DisableCourt } from './interfaces/disable-courts.interface';

@Controller('courts/disable-courts')
export class DisableCourtsController {
    constructor(private readonly disableCourtsService: DisableCourtsService) { }
    
    @UsePipes(new ValidationPipe({transform: true}))
    @UseGuards(JwtAuthGuard)
    @Post('')
    async createDisableCourt(@Req() req, @Body() body: CreateDisableCourtDTO): Promise<DisableCourt> {
        if (!req.user.isStaff) throw new HttpException("Not a Staff", HttpStatus.UNAUTHORIZED);
        return await this.disableCourtsService.createDisableCourt(body);
    }

    @UsePipes(new ValidationPipe({transform: true}))
    @Get('')
    async getDisableCourt(@Req() req, @Query('starting_date') starting_date: string, @Query('expired_date') expired_date: string, @Query('sport_id') sport_id: string, @Query('court_num') court_num: string, @Query('lean') lean: boolean): Promise<DisableCourt[]> {
        return await this.disableCourtsService.queryDisableCourt(starting_date, expired_date, sport_id, court_num, lean);
    }

    @UsePipes(new ValidationPipe({transform: true}))
    @Get('closed_time')
    async getClosedTime(@Req() req, @Query('sport_name') sport_name: string, @Query('court_num') court_num: number, @Query('date') dateString: string): Promise<Array<[number, number]>> {
        return await this.disableCourtsService.findClosedTimes(sport_name, court_num, new Date(dateString));
    }

    @UsePipes(new ValidationPipe({transform: true}))
    @Get(':id')
    async getDisableCourtById(@Req() req, @Param('id') id: string): Promise<DisableCourt> {
        return await this.disableCourtsService.getDisableCourt(id);
    }

    @UsePipes(new ValidationPipe({transform: true}))
    @UseGuards(JwtAuthGuard)
    @Delete('')
    async deleteAllDisableCourt(@Req() req): Promise<void> {
        if (!req.user.isStaff) throw new HttpException("Not a Staff", HttpStatus.UNAUTHORIZED);
        await this.disableCourtsService.deleteAllDisableCourt();
    }

    @UsePipes(new ValidationPipe({transform: true}))
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deleteDisableCourt(@Req() req, @Param('id') id: string): Promise<void> {
        if (!req.user.isStaff) throw new HttpException("Not a Staff", HttpStatus.UNAUTHORIZED);
        await this.disableCourtsService.deleteDisableCourt(id);
    }

    @UsePipes(new ValidationPipe({transform: true}))
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async editDisableCourt(@Req() req, @Param('id') id: string, @Body() body: EditDisableCourtDTO): Promise<DisableCourt> {
        if(!req.user.isStaff) throw new HttpException("Not a Staff",HttpStatus.UNAUTHORIZED);
        return await this.disableCourtsService.editDisableCourt(id,body);
    }

    @UsePipes(new ValidationPipe({transform: true}))
    @UseGuards(JwtAuthGuard)
    @Put(':id/add_disable_time')
    async addDisableTime(@Req() req, @Param('id') id: string, @Body() body: AddDisableTimeDTO){
        if(!req.user.isStaff) throw new HttpException("Not a Staff",HttpStatus.UNAUTHORIZED);
        await this.disableCourtsService.addDisableTime(id,body.disable_times);
    }
}
