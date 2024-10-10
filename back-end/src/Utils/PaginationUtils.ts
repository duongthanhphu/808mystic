// paginationUtils.ts

export interface PaginationResult<T> {
    data: T[];
    metadata: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
}

export async function paginateQuery<T>(
    queryFn: (skip: number, take: number) => Promise<T[]>,
    countFn: () => Promise<number>,
    page: number = 1,
    pageSize: number = 10
    ): Promise<PaginationResult<T>> {
    const skip = (page - 1) * pageSize;
    const [data, total] = await Promise.all([
        queryFn(skip, pageSize),
        countFn(),
    ]);

    return {
        data,
        metadata: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
        },
    };
}