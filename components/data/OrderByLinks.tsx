import Link from "next/link";

export default function OrderByLinks(props: { orderByMap: Map<string, string>, fieldsUiMap: Map<string, string>, route: string, queryParams: Record<string, string|string[]|undefined> })
{
    const ascMode = Boolean(Number.parseInt(props.queryParams.asc?.toString() ?? "0"));

    return (
        <div className="text-right">
            Ordem de exibição:
            {props.orderByMap.entries().toArray().map( ([ identifier, schemaKeyName ], index) =>
                <Link prefetch={false} key={index} className="link" href={{ pathname:
                    props.route,
                    query: { 
                        ...props.queryParams, 
                        order_by: identifier, 
                        asc: props.queryParams.order_by?.toString() === identifier
                            ? Number(!ascMode)
                            : 0
                    }
                }}>
                    {props.fieldsUiMap.get(schemaKeyName)}
                </Link>
                )
            }
        </div>
    );
}