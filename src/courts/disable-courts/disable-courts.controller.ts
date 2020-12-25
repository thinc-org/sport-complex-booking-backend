import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { CreateDisableCourtDTO, EditDisableCourtDTO, QueryDisableCourtDTO, QueryResult } from './disable-courts.dto';
import { DisableCourtsService } from './disable-courts.service';
import { DisableCourt } from './interfaces/disable-courts.interface';

@UsePipes(new ValidationPipe({ transform: true }))
@Controller('courts/disable-courts')
export class DisableCourtsController {
    constructor(private readonly disableCourtsService: DisableCourtsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('')
    async createDisableCourt(@Req() req, @Body() body: CreateDisableCourtDTO): Promise<DisableCourt> {
        if (!req.user.isStaff) throw new HttpException("Not a Staff", HttpStatus.UNAUTHORIZED);
        return await this.disableCourtsService.createDisableCourt(body);
    }

    @Post('/search')
    async getDisableCourt(@Body() data: QueryDisableCourtDTO): Promise<QueryResult> {
        return await this.disableCourtsService.queryDisableCourt(data);
    }

    @Get('closed_time')
    async getClosedTime(@Req() req, @Query('sport_id') sport_id: string, @Query('court_num') court_num: number, @Query('date') dateString: string): Promise<Array<number>> {
        return await this.disableCourtsService.findClosedTimes(sport_id, court_num, new Date(dateString));
    }

    @Get(':id')
    async getDisableCourtById(@Req() req, @Param('id') id: string): Promise<DisableCourt> {
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

    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async editDisableCourt(@Req() req, @Param('id') id: string, @Body() body: EditDisableCourtDTO): Promise<DisableCourt> {
        if (!req.user.isStaff) throw new HttpException("Not a Staff", HttpStatus.UNAUTHORIZED);
        return await this.disableCourtsService.editDisableCourt(id, body);
    }
}
