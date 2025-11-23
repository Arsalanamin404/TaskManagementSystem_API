import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private configSerivce: ConfigService) {}
  getAppName(): string {
    const APP_NAME = this.configSerivce.get<string>(
      'APP_NAME',
      'DEFAULT APP NAME',
    );
    console.log(`PORT: ${this.configSerivce.get<number>('PORT')}`);
    return APP_NAME;
  }
}
