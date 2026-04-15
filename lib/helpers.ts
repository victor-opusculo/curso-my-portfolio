import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import 'dayjs/locale/pt-br';

dayjs.extend(utc);

export function truncate(text: unknown, maxLength: number = 80) {
    const val = text ?? '';

    if (typeof val !== "string")
        return '';

    return val.length > maxLength
        ? val.substring(0, maxLength - 1) + '...'
        : val;
}

export function uiValueTransforms<AllowedColumns extends string>(
    functions: Record<AllowedColumns, (v: unknown) => any>
) {
    return (identifier: AllowedColumns, value: unknown) =>
        functions[identifier]?.(value);
}

export function rowsToUiTable<AllowedColumns extends string>(
    rows: Record<AllowedColumns, any>[],
    fieldsUiMap: Map<string, string>,
    uiValueTransformer: ReturnType<typeof uiValueTransforms<AllowedColumns>>,
    exclude: AllowedColumns[] = []
) {
    return rows.map(row => {
        const entries = Object.entries(row) as [string, unknown][];
        const newEntries = [] as [string, any][];

        for (const [identifier, value] of entries)
        {
            if (
                !exclude.includes(identifier as AllowedColumns) &&
                fieldsUiMap.has(identifier as AllowedColumns)
            )
                newEntries.push([
                    fieldsUiMap.get(identifier as AllowedColumns) ?? identifier,
                    uiValueTransformer(identifier as AllowedColumns, value)
                ]);
        }

        return Object.fromEntries(newEntries);
    });
}

export const utcToLocalString = (v: unknown) =>
    dayjs.utc(String(v)).local().locale('pt-br').format('DD/MM/YYYY HH:mm');