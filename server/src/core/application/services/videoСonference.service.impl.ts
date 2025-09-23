// import { Server } from 'socket.io';
// import ConsultationRoom from '../../domain/entities/consultationRoom.entity';
// import ConsultationRoomRepository from '../../domain/repositories/consulationRoom.repository';
// import ConsultationRepository from '../../domain/repositories/consultation.repository';
// import DoctorRepository from '../../domain/repositories/doctor.repository'
// import VideoConferenceService from '../../domain/services/videoConference.service';
// import { v4 as uuidv4 } from 'uuid';

// export default class VideoConferenceServiceImpl implements VideoConferenceService {
//     private io!: Server;
//     private activeRooms = new Map<string, Set<string>>();

//     constructor(
//         private readonly consultationRoomRepository: ConsultationRoomRepository,
//         private readonly consultationRepository: ConsultationRepository,
//         private readonly doctorRepository: DoctorRepository
//     ) { }

//     setIo(io: Server) {
//         this.io = io;
//         this.setupSocketHandlers();
//     }

//     async getParticipants(consultationId: number) {
//         const room = await this.consultationRoomRepository.findByConsultationId(consultationId);
//         if (!room) {
//             throw new Error('Комната не найдена');
//         }
//         return this.consultationRoomRepository.getParticipants(room.id);
//     }

//     async validateAccess(userId: number, consultationId: number, role: string): Promise<boolean> {
//         const consultation = await this.consultationRepository.findById(consultationId);
//         if (!consultation) return false;

//         if (role === 'DOCTOR') {
//             const doctor = await this.doctorRepository.findByUserId(userId)
//             return consultation.doctorId === doctor?.id;
//         } else if (role === 'PATIENT') {
//             return consultation.userId === userId;
//         }

//         return false;
//     }

//     async handleDisconnect(socketId: string) {
//         for (const [roomId, sockets] of this.activeRooms.entries()) {
//             if (sockets.has(socketId)) {
//                 sockets.delete(socketId);
//                 if (sockets.size === 0) {
//                     this.activeRooms.delete(roomId);
//                 }
//                 break;
//             }
//         }
//     }

//     async startConsultation(consultationId: number): Promise<string> {
//         let room = await this.consultationRoomRepository.findByConsultationId(consultationId);

//         if (!room) {
//             // Если комнаты нет, создаем новую
//             room = await this.consultationRoomRepository.create(
//                 new ConsultationRoom(
//                     0, // id создается в базе
//                     consultationId,
//                     this.generateRoomId(), // сгенерировать уникальный roomId
//                     'PENDING',
//                     null,
//                     null,
//                     []
//                 )
//             );
//         }

//         // Ставим статус ACTIVE
//         const updatedRoom = await this.consultationRoomRepository.save(room.startRoom());
//         return updatedRoom.roomId;
//     }

//     async addParticipant(consultationId: number, userId: number, role: "PATIENT" | "DOCTOR") {
//         const room = await this.consultationRoomRepository.findByConsultationId(consultationId);
//         if (!room) throw new Error("Комната не найдена");

//         const updatedRoom = await this.consultationRoomRepository.addParticipant(room.id, userId, role);

//         // ⚡ Отправляем в комнату событие о новом участнике
//         this.io.to(updatedRoom.roomId).emit("participantJoined", { userId, role });

//         return updatedRoom;
//     }

//     async removeParticipant(consultationId: number, userId: number) {
//         const room = await this.consultationRoomRepository.findByConsultationId(consultationId);
//         if (!room) throw new Error("Комната не найдена");

//         const updatedRoom = await this.consultationRoomRepository.removeParticipant(room.id, userId);

//         console.log(updatedRoom.roomId)
//         // ⚡ Сообщаем всем, что участник вышел
//         this.io.to(updatedRoom.roomId).emit("participantLeft", { userId });

//         return updatedRoom;
//     } 

//     async getAllRooms(): Promise<Array<{ roomId: string; consultationId: number; status: string }>> {
//         const rooms = await this.consultationRoomRepository.findAll(); // возвращает все комнаты из БД
//         return rooms.map((r: { roomId: any; consultationId: any; status: any; }) => ({
//             roomId: r.roomId,
//             consultationId: r.consultationId,
//             status: r.status
//         }));
//     }

//     private setupSocketHandlers() {
//         this.io.on('connection', (socket) => {
//             console.log('Клиент подключился к видеоконференции:', socket.id);

//             socket.on('join-consultation-room', async (data: {
//                 consultationId: number;
//                 userId: number;
//                 role: 'PATIENT' | 'DOCTOR';
//             }) => {
//                 try {
//                     const consultation = await this.consultationRepository.findById(data.consultationId);
//                     if (!consultation) {
//                         socket.emit('error', { message: 'Консультация не найдена' });
//                         return;
//                     }

//                     const hasAccess = await this.validateAccess(data.userId, data.consultationId, data.role);
//                     if (!hasAccess) {
//                         socket.emit('error', { message: 'Доступ запрещен' });
//                         return;
//                     }

//                     let room = await this.consultationRoomRepository.findByConsultationId(data.consultationId);
//                     if (!room) {
//                         room = await this.consultationRoomRepository.create(
//                             new ConsultationRoom(
//                                 0,
//                                 data.consultationId,
//                                 this.generateRoomId(),
//                                 'PENDING',
//                                 null,
//                                 null,
//                                 []
//                             )
//                         );
//                     }

//                     socket.join(room.roomId);
//                     this.addToActiveRoom(room.roomId, socket.id);

//                     room = await this.consultationRoomRepository.addParticipant(
//                         room.id,
//                         data.userId,
//                         data.role
//                     );

//                     socket.emit('room-joined', {
//                         roomId: room.roomId,
//                         consultationId: data.consultationId
//                     });

//                     socket.to(room.roomId).emit('participant-joined', {
//                         userId: data.userId,
//                         socketId: socket.id
//                     });

//                 } catch (error) {
//                     socket.emit('error', { message: 'Ошибка присоединения к комнате' });
//                 }
//             });

//             socket.on('webrtc-offer', (data: { offer: any; to: string; roomId: string }) => {
//                 socket.to(data.to).emit('webrtc-offer', {
//                     offer: data.offer,
//                     from: socket.id
//                 });
//             });

//             socket.on('webrtc-answer', (data: { answer: any; to: string }) => {
//                 socket.to(data.to).emit('webrtc-answer', {
//                     answer: data.answer,
//                     from: socket.id
//                 });
//             });

//             socket.on('webrtc-ice-candidate', (data: { candidate: any; to: string }) => {
//                 socket.to(data.to).emit('webrtc-ice-candidate', {
//                     candidate: data.candidate,
//                     from: socket.id
//                 });
//             });

//             socket.on('end-consultation', async (data: { consultationId: number; userId: number }) => {
//                 try {
//                     const room = await this.consultationRoomRepository.findByConsultationId(data.consultationId);
//                     if (room) {
//                         await this.consultationRoomRepository.save(room.endRoom());
//                         this.io.to(room.roomId).emit('consultation-ended');
//                     }
//                 } catch (error) {
//                     socket.emit('error', { message: 'Ошибка завершения консультации' });
//                 }
//             });

//             socket.on('disconnect', () => {
//                 this.handleDisconnect(socket.id);
//             });
//         });
//     }

//     private generateRoomId(): string {
//         return `room_${uuidv4()}`;
//     }

//     private addToActiveRoom(roomId: string, socketId: string) {
//         if (!this.activeRooms.has(roomId)) {
//             this.activeRooms.set(roomId, new Set());
//         }
//         this.activeRooms.get(roomId)!.add(socketId);
//     }
// }