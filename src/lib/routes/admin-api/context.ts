import { Request, Response } from 'express';

import Controller from '../controller';

import { extractUsername } from '../../util/extract-user';

import {
    CREATE_CONTEXT_FIELD,
    UPDATE_CONTEXT_FIELD,
    DELETE_CONTEXT_FIELD,
} from '../../types/permissions';
import { IUnleashConfig } from '../../types/option';
import { IUnleashServices } from '../../types/services';
import ContextService from '../../services/context-service';
import { Logger } from '../../logger';
import { IAuthRequest } from '../unleash-types';
import { IConstraint } from 'lib/types/model';

class ContextController extends Controller {
    private logger: Logger;

    private contextService: ContextService;

    constructor(
        config: IUnleashConfig,
        { contextService }: Pick<IUnleashServices, 'contextService'>,
    ) {
        super(config);
        this.logger = config.getLogger('/admin-api/context.ts');
        this.contextService = contextService;

        this.get('/', this.getContextFields);
        this.post('/', this.createContextField, CREATE_CONTEXT_FIELD);
        this.get('/:contextField', this.getContextField);
        this.put(
            '/:contextField',
            this.updateContextField,
            UPDATE_CONTEXT_FIELD,
        );
        this.delete(
            '/:contextField',
            this.deleteContextField,
            DELETE_CONTEXT_FIELD,
        );
        this.post('/validate', this.validate, UPDATE_CONTEXT_FIELD);
    }

    async getContextFields(req: Request, res: Response): Promise<void> {
        const fields = await this.contextService.getAll();
        res.status(200).json(fields).end();
    }

    async getContextField(req: Request, res: Response): Promise<void> {
        try {
            const name = req.params.contextField;
            const contextField = await this.contextService.getContextField(
                name,
            );
            res.json(contextField).end();
        } catch (err) {
            res.status(404).json({ error: 'Could not find context field' });
        }
    }

    async createContextField(req: IAuthRequest, res: Response): Promise<void> {
        const value = req.body;
        const userName = extractUsername(req);

        await this.contextService.createContextField(value, userName);
        res.status(201).end();
    }

    async updateContextField(req: IAuthRequest, res: Response): Promise<void> {
        const name = req.params.contextField;
        const userName = extractUsername(req);
        const contextField = req.body;

        contextField.name = name;

        await this.contextService.updateContextField(contextField, userName);
        res.status(200).end();
    }

    async deleteContextField(req: IAuthRequest, res: Response): Promise<void> {
        const name = req.params.contextField;
        const userName = extractUsername(req);

        await this.contextService.deleteContextField(name, userName);
        res.status(200).end();
    }

    async validate(req: Request, res: Response): Promise<void> {
        const { name } = req.body;

        await this.contextService.validateName(name);
        res.status(200).end();
    }
}
export default ContextController;
module.exports = ContextController;
