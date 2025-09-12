// consultation-room.repository.impl.ts
import ConsultationRoom from "../../domain/entities/consultationRoom.entity";
import ConsultationRoomRepository from "../../domain/repositories/consulationRoom.repository";
import models from "../../../infrastructure/persostence/models/models";

export default class ConsultationRoomRepositoryImpl implements ConsultationRoomRepository {
    async findByConsultationId(consultationId: number): Promise<ConsultationRoom | null> {
        const room = await models.ConsultationRoomModel.findOne({
            where: { consultationId }
        });
        return room ? this.mapToDomainConsulationRoom(room) : null;
    }

    async findAll(): Promise<ConsultationRoom[]> {
        const rooms = await models.ConsultationRoomModel.findAll();
        return rooms.map(room => this.mapToDomainConsulationRoom(room)); // ✅ добавлен this
    }

    async create(room: ConsultationRoom): Promise<ConsultationRoom> {
        const created = await models.ConsultationRoomModel.create(this.mapToPersistence(room));
        return this.mapToDomainConsulationRoom(created);
    }

    async update(room: ConsultationRoom): Promise<ConsultationRoom> {
        const [affectedCount, affectedRows] = await models.ConsultationRoomModel.update(this.mapToPersistence(room), { where: { id: room.id }, returning: true });
        if (affectedCount === 0 || !affectedRows || affectedRows.length === 0) {
            throw new Error('Пользователь не был обновлен');
        }
        const updatedRoom = affectedRows[0];
        return this.mapToDomainConsulationRoom(updatedRoom);
    }

    async save(room: ConsultationRoom): Promise<ConsultationRoom> {
        return room.id ? await this.update(room) : await this.create(room);
    }

    async delete(id: number): Promise<void> {
        await models.ConsultationRoomModel.destroy({ where: { id } });
    }

    async getParticipants(roomId: number): Promise<Array<{
        userId: number;
        joinedAt: Date;
        leftAt: Date | null;
        role: 'PATIENT' | 'DOCTOR';
    }>> {
        const room = await models.ConsultationRoomModel.findByPk(roomId);
        if (!room) {
            throw new Error('Комната не найдена');
        }
        return room.participants || [];
    }

    async removeParticipant(roomId: number, userId: number): Promise<ConsultationRoom> {
        const room = await models.ConsultationRoomModel.findByPk(roomId);
        if (!room) throw new Error("Комната не найдена");

        const participants = room.participants || [];

        const updatedParticipants = participants.map((p: any) =>
            p.userId === userId && p.leftAt === null
                ? { ...p, leftAt: new Date() }
                : p
        );

        const updated = await room.update({ participants: updatedParticipants });
        return this.mapToDomainConsulationRoom(updated);
    }



    async addParticipant(roomId: number, userId: number, role: 'PATIENT' | 'DOCTOR'): Promise<ConsultationRoom> {
        const room = await models.ConsultationRoomModel.findByPk(roomId);
        if (!room) throw new Error('Комната не найдена');

        const participants = room.participants || [];
        const existing = participants.find(p => p.userId === userId && p.leftAt === null);

        if (!existing) {
            const newParticipant = { userId, joinedAt: new Date(), leftAt: null, role };
            const updated = await room.update({ participants: [...participants, newParticipant] }); // ✅ создаём новый массив
            return this.mapToDomainConsulationRoom(updated);
        }

        return this.mapToDomainConsulationRoom(room);
    }


    private mapToDomainConsulationRoom(roomModel: any): ConsultationRoom {
        return new ConsultationRoom(
            roomModel.id,
            roomModel.consultationId,
            roomModel.roomId,
            roomModel.status,
            roomModel.startTime,
            roomModel.endTime,
            roomModel.participants || []
        );
    }

    private mapToPersistence(room: ConsultationRoom): any {
        return {
            consultationId: room.consultationId,
            roomId: room.roomId,
            status: room.status,
            startTime: room.startTime,
            endTime: room.endTime,
            participants: room.participants
        };
    }
}