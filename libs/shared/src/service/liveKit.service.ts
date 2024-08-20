import { Injectable } from '@nestjs/common';
import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';

@Injectable()
export class LivekitService {
  private readonly roomService: RoomServiceClient;

  constructor() {
    this.roomService = new RoomServiceClient(
      process.env.LIVEKIT_URL, // LiveKit sunucu URL'si
      process.env.LIVEKIT_API_KEY, // API anahtarı
      process.env.LIVEKIT_API_SECRET, // API sırrı
    );
  }

  generateToken(roomName: string, participantName: string): Promise<string> {
    const token = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: participantName,
      },
    );
    token.addGrant({
      roomJoin: true,
      room: roomName,
    });
    return token.toJwt();
  }

  async createRoom(roomName: string) {
    return await this.roomService.createRoom({ name: roomName });
  }

  // Diğer LiveKit işlemleri
}
