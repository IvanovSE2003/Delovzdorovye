import { IProfDataCreationAttributes, ProfDataModelInterface } from "../../../infrastructure/persostence/models/interfaces/profData.model";
import ProfData from "../../domain/entities/profData.entity";
import ProfDataRepository from "../../domain/repositories/profData.repository";
import models from "../../../infrastructure/persostence/models/models";

export default class ProfDataRepositoryImpl implements ProfDataRepository {
    async findAll(page: number, limit: number, filters: any = {}): Promise<{ profData: ProfData[]; totalCount: number; totalPage: number }> {
        const offset = (page - 1) * limit;
        const { count, rows } = await models.ProfDataModel.findAndCountAll({
            limit,
            offset,
            include: [{
                model: models.UserModel,
                attributes: ['name', 'surname', 'patronymic']
            }]
        });

        return {
            profData: rows.map(data => this.mapToDomainProfData(data)),
            totalCount: count,
            totalPage: Math.ceil(count / limit)
        };
    }

    async findById(id: number): Promise<ProfData | null> {
        const profData = await models.ProfDataModel.findByPk(id);
        return profData ? this.mapToDomainProfData(profData) : null
    }

    async create(profData: ProfData): Promise<ProfData> {
        const createdProfData = await models.ProfDataModel.create(this.mapToPersistence(profData));
        return this.mapToDomainProfData(createdProfData);
    }

    async update(profData: ProfData): Promise<ProfData> {
        const [affectedCount, affectedRows] = await models.ProfDataModel.update(this.mapToPersistence(profData), { where: { id: profData.id }, returning: true });
        if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
            throw new Error('Фиксация изменения профессиональных данных не была обновлена');
        }
        const updatedProfData = affectedRows[0];
        return this.mapToDomainProfData(updatedProfData);
    }

    async save(profData: ProfData): Promise<ProfData> {
        const [profDataModel, created] = await models.ProfDataModel.findOrCreate({
            where: {
                userId: profData.userId,
                new_specialization: profData.new_specialization
            },
            defaults: this.mapToPersistence(profData)
        });

        if (!created) {
            await profDataModel.update(this.mapToPersistence(profData));
            await profDataModel.reload();
        }

        return this.mapToDomainProfData(profDataModel);
    }

    async delete(id: number): Promise<void> {
        const deletedCount = await models.ProfDataModel.destroy({ where: { id } });
        if (deletedCount === 0) {
            throw new Error('Фиксация изменения профессиональных данных не найдена или не была удалена');
        }
    }

    private mapToDomainProfData(profModel: ProfDataModelInterface): ProfData {
        const profData = new ProfData(
            profModel.id,
            profModel.new_diploma,
            profModel.new_license,
            profModel.new_specialization,
            profModel.comment,
            profModel.type,
            profModel.userId
        )

        if (profModel.user) {
            profData.userName = profModel.user.name ?? "";
            profData.userSurname = profModel.user.surname ?? "";
            profData.userPatronymic = profModel.user.patronymic ?? "";
        }

        return profData;
    }

    private mapToPersistence(profData: ProfData): IProfDataCreationAttributes {
        return {
            new_diploma: profData.new_diploma,
            new_license: profData.new_license,
            new_specialization: profData.new_specialization,
            comment: profData.comment,
            type: profData.type,
            userId: profData.userId
        } as IProfDataCreationAttributes;
    }
}