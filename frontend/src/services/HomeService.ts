import type { AxiosResponse } from "axios";
import $api from "../http";
import type { InfoBlock } from "../models/InfoBlock";

export default class HomeService {
    static async getContent(type: string): Promise<AxiosResponse<InfoBlock[]>> {
        return $api.get<InfoBlock[]>(`/content/all?type=${type}`);
    }

    static async editContent(type: string, newData: InfoBlock): Promise<void> {
        $api.put<void>(`/content/${newData.id}`, { title: newData.header, content: newData.text, type, hasTitle: true})
    }

    // static async addContent(type: string) {
    //     $api.post(`/content/`, {})
    // }

    // static async deleteContent(type: string, id: number) {
    //     return $api.delete(`/content/${id}`);
    // }
}