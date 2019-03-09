import Controller from './Controller';
import Loterias from '../api/Loterias';
import Loteria from '../models/Loteria';
import Bolao from '../models/Bolao';
import Game from '../models/Game';
import Apostar from '../models/Apostar';
import { msDate, meses } from "../api/util";
import Cart from '../api/Cart';
class AposteAqui extends Controller {
 
    constructor() {
        super();
        this.apostar = new Apostar(true, this);
    }
 
    async start() {
        this.apostar.start();
        setInterval(()=> this.reload(), 500);
    }
}
export default AposteAqui;