import { InvoicesDao } from './dao/invoices.dao';
import { CreateInvoiceDto } from './dto/invoices.dto';

export class InvoicesService {
    private invoicesDao = new InvoicesDao();

    async create(values: CreateInvoiceDto) {
        return await this.invoicesDao.create(values);
    }

    async delete(id: string) {
        await this.invoicesDao.delete(id);
    }

    async getAll(
        status: string,
        limit: number,
        page: number,
        filter: any,
        from: Date,
        to: Date,
        region?: string
    ) {
        return await this.invoicesDao.getAll(
            status,
            limit,
            page,
            filter,
            from,
            to,
            region
        );
    }
}
