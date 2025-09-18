import ContentRepositoryImpl from "../../../../core/application/repositories/content.repository.impl";
import ContentController from "./content.controller";

const contentService = new ContentRepositoryImpl();
const contentController = new ContentController(contentService);

export default contentController;