import { http } from "./util";
import { url } from "../config.json";

class ServiceConteudo {

    static async get(path) {
        var timeSpan = Date.now().getTime();
        var path_url = `/json/${path}?timeSpan=${timeSpan}`;

        return await http.get(path_url);
    }

}
export default ServiceConteudo;