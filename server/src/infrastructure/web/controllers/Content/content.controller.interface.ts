import ContentServiceImpl from "../../../../core/application/services/content.service.impl";
import ContentController from "./content.controller";

const contentService = new ContentServiceImpl();
const contentController = new ContentController(contentService);

export default contentController;