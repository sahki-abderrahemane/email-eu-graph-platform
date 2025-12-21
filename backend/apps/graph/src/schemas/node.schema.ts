
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NodeDocument = HydratedDocument<Node>;

@Schema()
export class Node {
    @Prop({ required: true, index: true })
    nodeId: number;

    @Prop({ required: true })
    department: number;

    @Prop()
    label: string; // Optional label, we'll default to "Node X"
}

export const NodeSchema = SchemaFactory.createForClass(Node);
