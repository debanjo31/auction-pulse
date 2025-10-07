import { NestFactory } from '@nestjs/core';
import { BidModule } from './bid.module';

async function bootstrap() {
  const app = await NestFactory.create(BidModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
