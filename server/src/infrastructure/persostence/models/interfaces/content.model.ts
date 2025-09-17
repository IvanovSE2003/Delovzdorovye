import { Model, Optional } from 'sequelize';

interface IContentAttributes {
    id: number;
    type: string;
    text_content: string;
    label?: string;
}

export interface IContentCreationAttributes extends Optional<IContentAttributes, 'id'> {}
export interface ContentModelInterface extends Model<IContentAttributes, IContentCreationAttributes>, IContentAttributes {}