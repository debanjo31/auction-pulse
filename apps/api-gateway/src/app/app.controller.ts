import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientKafka } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('KAFKA_SERVICE') private readonly kafkaClient: ClientKafka
  ) {}

  @Get()
  getData() {
    return this.appService.getData();
  }

  @Post('auction')
  createAuction(@Body() auction: any) {
    this.kafkaClient.emit('auction-created', auction);
    return { message: 'Auction created set to kafka', auction };
  }
}
