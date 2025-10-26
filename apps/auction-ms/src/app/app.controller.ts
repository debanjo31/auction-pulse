import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientKafka, MessagePattern, Payload } from '@nestjs/microservices';

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

  @MessagePattern('auction-created')
  handleOrderCreated(@Payload() auction: any) {
    console.log('[Auction-Service]: Received new auction:', auction);
    // Simulate Processing the auction started

    this.kafkaClient.emit('auction-started-processed', auction);
  }
}
