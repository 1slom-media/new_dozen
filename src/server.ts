import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import { origins } from './config/conf';
import expressFileUpload from 'express-fileupload';
import express, { Express, Router } from 'express';
import errorHandler from './modules/shared/middlewares/errorHandler';
import { express as ExpressUseragent } from 'express-useragent';

class App {
    public app: Express;

    constructor(router: Router) {
        this.app = express();

        this.initializeMiddlewares();
        this.initializeRoutes(router);
        this.initializeErrorHandling();
    }

    public get getServer() {
        return this.app;
    }

    private initializeMiddlewares() {
        this.app.use(
            cors({
                origin: [
                    'http://localhost:3000',
                    'http://localhost:3001',
                    'http://localhost:3002',
                    origins.origin1,
                    origins.origin2,
                    origins.origin3,
                    origins.origin4,
                    origins.origin5,
                    origins.origin6,
                    origins.origin7,
                    origins.origin8,
                ],
                methods: ['GET', 'POST', 'PUT', 'DELETE'],
                credentials: true,
            })
        );
        this.app.use(express.json());
        this.app.use(ExpressUseragent());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(expressFileUpload({ useTempFiles: true }));
        this.app.use(
            '/api/uploads',
            express.static(path.join(__dirname, '..', 'public', 'uploads'))
        );
        this.app.use(morgan('tiny'));
    }

    private initializeRoutes(router: Router) {
        this.app.use('/api', router);
    }
    private initializeErrorHandling() {
        this.app.use(errorHandler);
    }
}

export default App;
