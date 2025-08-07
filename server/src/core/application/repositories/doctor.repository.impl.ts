// import Patient from '../../domain/entities/patient.entity.js';
// import models from '../../../infrastructure/persostence/models/models.js';
// import DoctorRepository from '../../domain/repositories/doctor.repository.js';

// const {UserModel, DoctorModel} = models;

// export default class DoctorRepositoryImpl implements DoctorRepository {

//     async findById(id: number) {
//         const doctor = await DoctorModel.findByPk(id);
//         return doctor ? this.mapToDomainPatient(doctor) : null;
//     }

//     async findByUserId(userId: number) {
//         const user = await UserModel.findByPk(userId);
//         const patient = await PatientModel.findByPk(user?.id);
//         return patient ? this.mapToDomainPatient(patient) : null;
//     }

//     async update(patient: Patient): Promise<Patient> {
//         if (!patient.id) {
//             throw new Error("ID пациента не найдено для обновления");
//         }

//         const [affectedCount, updatedPatients] = await PatientModel.update(
//             this.mapToPersistence(patient),
//             {
//                 where: { id: patient.id },
//                 returning: true 
//             }
//         );

//         if (affectedCount === 0 || !updatedPatients || updatedPatients.length === 0) {
//             throw new Error(`Пациент с id ${patient.id} не найден`);
//         }

//         const updatedPatient = updatedPatients[0] as PatientModelInterface;
//         return this.mapToDomainPatient(updatedPatient);
//     }

//     async create(patient: Patient): Promise<Patient> {
//         const createdPatient = await PatientModel.create(this.mapToPersistence(patient));
//         return this.mapToDomainPatient(createdPatient);
//     }


//     private mapToDomainPatient(patientModel: DoctorModelInterface): Patient {
//         return new Doctor(
//             this.id,
//             this.
//         );
//     }

//     private mapToPersistence(patient: Patient): IDoctorCreationAttributes {
//         return {
//             general_info: patient.generalInfo,
//             analyses_examinations: patient.analysesExaminations,
//             additionally: patient.additionally,
//             activate: patient.isActivated 
//         };
//     }
// }