import videoConferenceService from "../../../../socket/videoConferenceService";
import VideoConferenceController from "./videoConference.controller";

const videoConferenceController = new VideoConferenceController(videoConferenceService);

export default videoConferenceController;