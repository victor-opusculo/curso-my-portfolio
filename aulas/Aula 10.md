# Aula 10

## Mais componentes

1. Em `components/data`, criar `Gallery.tsx` com:

    ```tsx
    interface GalleryProps<T>
    {
        rows: T[],
        imageGetter: (row: T) => string,
        linkGetter: (row: T) => string,
        overlayElementsGetters: ((row: T) => string)[],
        whiteBackground?: boolean
    }


    export default function Gallery<T>(props: GalleryProps<T>)
    {
        const getBg = () => props.whiteBackground ? 'bg-white' : 'bg-transparent';
        const getBorderColor = () => props.whiteBackground ? 'border-zinc-300' : 'border-zinc-500';
        const getOverlayColor = () => props.whiteBackground ? 'bg-neutral-500/80' : 'bg-neutral-600/80';

        return (
            <div className="flex flex-col md:flex-row md:flex-wrap p-4 justify-center items-center">
                {
                    props.rows.length > 0
                    ? props.rows.map( (row, ridx) =>
                        <a 
                            key={ridx} 
                            className={`${getBorderColor()}  m-2 border relative block overflow-clip h-[300px] w-[300px] hover:brightness-75 ${getBg()} rounded-lg`}
                            href={props.linkGetter(row)}
                        >
                            <div className="absolute top-0 bottom-0 left-0 right-0 w-full h-full">
                                <img src={props.imageGetter(row) || "/nopic.png"} alt="Item de galeria" className="absolute top-0 bottom-0 left-0 right-0 m-auto max-w-full max-h-full" />
                            </div>
                            <div className={`absolute bottom-0 left-0 right-0 z-10 ${getOverlayColor()} p-2 text-center`}>
                                {props.overlayElementsGetters.map( (getter, gidx) =>
                                    <div key={gidx}>{getter(row)}</div>
                                )}
                            </div>
                        </a>
                    )
                    :
                    <p>Não há dados disponíveis</p>
                }
            </div>
        );
    }
    ```

1. Depois `Spinner.tsx` com:

    ```tsx
    export default function Spinner(props: { className?: string })
    {
        return <svg className={`${props.className} animate-spin`} version="1.1" x="0px" y="0px" viewBox="0 0 1000 1000" enableBackground="new 0 0 1000 1000">
        <metadata> Svg Vector Icons : http://www.onlinewebfonts.com/icon </metadata>
        <g><path d="M500,10C229.4,10,10,229.4,10,500c0,270.6,219.4,490,490,490c270.6,0,490-219.4,490-490C990,229.4,770.6,10,500,10z M500,255c135.3,0,245,109.7,245,245S635.3,745,500,745S255,635.3,255,500S364.7,255,500,255z M792.3,792.3C714.3,870.4,610.4,913.4,500,913.4s-214.3-43-292.3-121.1C129.6,714.3,86.6,610.4,86.6,500s43-214.3,121.1-292.3l65,65l0,0C147.2,398,147.2,602,272.6,727.4c60.7,60.7,141.5,94.2,227.4,94.2s166.6-33.4,227.4-94.2c125.4-125.4,125.4-329.4,0-454.8l65-65c78.1,78.1,121.1,181.9,121.1,292.3S870.4,714.3,792.3,792.3L792.3,792.3z"/></g>
        </svg>;
    }
    ```

1. `HistoryBackButton.tsx` com:

    ```tsx
    "use client";

    export default function HistoryBackButton()
    {
        return <button type="button" className="btn" onClick={() => history.back()}>{" << Voltar "}</button>;
    }
    ```

1. Por fim, `DeleteEntityForm.tsx` com:

    ```tsx
    "use client";

    import { useRouter } from "next/navigation";

    export default function DeleteEntityForm(props: { children: any, serverAction: () => void })
    {
        const router = useRouter();

        return (
            <form action={props.serverAction}>
                {props.children}

                <div className="my-4">
                    <button type="submit" className="btn mr-2">Sim, excluir</button>
                    <button type="button" className="btn" onClick={() => router.back()}>Não excluir</button>
                </div>
            </form>
        )
    }
    ```

## Funções auxiliares para exibição de dados

1. Dentro de `lib`, criar o arquivo `helpers.ts` com:

    ```ts
    import dayjs from 'dayjs';
    import utc from 'dayjs/plugin/utc';
    import 'dayjs/locale/pt-br';

    dayjs.extend(utc);

    export function truncate(text: unknown, maxLength: number = 80) {
        const val = text ?? '';

        if (typeof val !== 'string') return '';

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
        return rows.map((row) => {
            const entries = Object.entries(row) as [string, unknown][];
            const newEntries = [] as [string, any][];

            for (const [identifier, value] of entries)
                if (
                    !exclude.includes(identifier as AllowedColumns) &&
                    fieldsUiMap.has(identifier as AllowedColumns)
                )
                    newEntries.push([
                        fieldsUiMap.get(identifier as AllowedColumns) ?? identifier,
                        uiValueTransformer(identifier as AllowedColumns, value),
                    ]);

            return Object.fromEntries(newEntries);
        });
    }

    export const utcToLocalString = (v: unknown) =>
        dayjs.utc(String(v)).local().locale('pt-br').format('DD/MM/YYYY HH:mm');

    ```