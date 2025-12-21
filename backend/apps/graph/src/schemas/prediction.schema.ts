import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type PredictionHistoryDocument = HydratedDocument<PredictionHistory>;

@Schema({ timestamps: true })
export class PredictionHistory extends Document {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    type: string; // 'department' | 'link'

    @Prop({ required: true, type: Object })
    input: any;

    @Prop({ required: true, type: Object })
    result: any;

    @Prop({ required: true })
    confidence: number;
}

export const PredictionHistorySchema = SchemaFactory.createForClass(PredictionHistory);
