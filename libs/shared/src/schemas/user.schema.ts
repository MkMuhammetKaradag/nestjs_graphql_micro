// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document } from 'mongoose';

// export type UserDocument = User & Document;
// export type UserRole = 'USER' | 'ADMIN';
// @Schema()
// export class User {
//   @Prop({
//     type: String,
//     maxlength: [128, 'Maximum 128 characters'],
//     trim: true,
//   })
//   firstName: string;

//   @Prop({
//     type: String,
//     maxlength: [128, 'Maximum 128 characters'],
//     trim: true,
//   })
//   lastName: string;

//   @Prop({
//     type: String,
//     required: true,
//     unique: true,
//     trim: true,
//   })
//   email: string;

//   @Prop({
//     type: String,
//     required: true,
//   })
//   password: string;

//   @Prop({
//     type: String,
//   })
//   profile_image: string;

//   @Prop({
//     type: String,
//     enum: ['USER', 'ADMIN'],
//     default: 'USER',
//     required: true,
//   })
//   type: UserRole;
// }

// export const UserSchema = SchemaFactory.createForClass(User);

// // UserSchema.pre('save', async function (next: HookNextFunction) {
// //     if (this.isModified('password')) {
// //       const hashedPassword = await hash(this.get('password'), 10);
// //       this.set('password', hashedPassword);
// //     }

// //     return next();
// //   });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
