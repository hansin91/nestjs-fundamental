import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

@Schema()
export class Event extends mongoose.Document {
  @Prop()
  type: string;

  @Prop({ index: true })
  name: string;

  @Prop()
  payload: mongoose.Schema.Types.Mixed;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ name: 1, type: -1 });
