import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CreateDisableCourtDTO } from './disable-courts.dto';
import { DisableCourtsService } from './disable-courts.service';
import { DisableCourt } from './interfaces/disable-courts.interface';

@Controller('courts/disable-courts')
export class DisableCourtsController {
    constructor(private readonly disableCourtsService: DisableCourtsService) { }
    @Post('')
    async createDisableCourt(@Body() body: CreateDisableCourtDTO, @Query('merge') merge: boolean): Promise<DisableCourt> {
        return await this.disableCourtsService.createDisableCourt(body, merge);
    }

    @Get('')
    async getAllDisableCourt(): Promise<DisableCourt[]> {
        return await this.disableCourtsService.getAllDisableCourt();
    }
    
    @Get('closed_time')
    async getClosedTime(@Query('sport_name') sport_name: string, @Query('court_num') court_num: number, @Query('date') dateString: string): Promise<Array<[number,number]>> {
        return await this.disableCourtsService.findClosedTimes(sport_name,court_num,new Date(dateString));
    }

    @Get(':id')
    async getDisableCourt(@Param('id') id: string): Promise<DisableCourt> {
        return await this.disableCourtsService.getDisableCourt(id);
    }

    @Delete('')
    async deleteAllDisableCourt(): Promise<void> {
        await this.disableCourtsService.deleteAllDisableCourt();
    }

    @Delete(':id')
    async deleteDisableCourt(@Param('id') id: string): Promise<void> {
        await this.disableCourtsService.deleteDisableCourt(id);
    }

}
