
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type EdgeDocument = HydratedDocument<Edge>;

@Schema()
export class Edge {
    @Prop({ required: true, index: true })
    source: number;

    @Prop({ required: true, index: true })
    target: number;
}

export const EdgeSchema = SchemaFactory.createForClass(Edge);
