import BatchRepositoryImpl from "../../../../core/application/repositories/batch.repository.impl.js";
import BatchController from "./batch.controller.js";

const BatchRepository = new BatchRepositoryImpl();
const batchController = new BatchController(BatchRepository);

export default batchController;