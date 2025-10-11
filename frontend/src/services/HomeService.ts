import type { AxiosResponse } from "axios";
import $api from "../http";
import type { InfoBlock, InfoBlockResponse } from "../models/InfoBlock";
import type { TypeResponse } from "../models/response/DefaultResponse";

export default class HomeService {
    static async getContent(type: string): Promise<AxiosResponse<InfoBlockResponse>> {
        return $api.get<InfoBlockResponse>(`/content/all?type=${type}`);
    }

    static async editContent(type: string, newData: InfoBlock): Promise<AxiosResponse<TypeResponse>> {
        return $api.put<TypeResponse>(`/content/${newData.id}`, { title: newData.header, content: newData.text, type})
    }

    static async addContent(type: string, newData: InfoBlock): Promise<AxiosResponse<TypeResponse>> {
        return $api.post<TypeResponse>('/content/create', { title: newData.header, content: newData.text, type})
    }

    static async deleteContent(blockId: number): Promise<AxiosResponse<TypeResponse>> {
        return $api.delete<TypeResponse>(`/content/${blockId}`)
    }

    // static async addContent(type: string) {
    //     $api.post(`/content/`, {})
    // }

    // static async deleteContent(type: string, id: number) {
    //     return $api.delete(`/content/${id}`);
    // }
}