import { Module } from '@nestjs/common';
import { LivekitService } from '../service/liveKit.service';

@Module({
  providers: [LivekitService],
  exports: [LivekitService],
})
export class LivekitModule {}
