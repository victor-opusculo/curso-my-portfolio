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
                        className={`${getBorderColor()} m-2 border relative block overflow-clip h-[300px] w-[300px] hover:brightness-75 ${getBg()} rounded-lg`}
                        href={props.linkGetter(row)}
                    >

                        <div className="absolute top-0 bottom-0 left-0 right-0 w-full h-full">
                            <img src={props.imageGetter(row) || "/nopic.png"} 
                            alt="Item da galeria"
                            className="absolute top-0 bottom-0 left-0 right-0 m-auto max-w-full max-h-full" 
                            />
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