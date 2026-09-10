# @onetype/stack-app-kit

## Functions

### boot(say: LogLine, plugins: readonly HostPlugin[]): RunningApp

### cachePlugin(client: Queries): HostPlugin

### definePlugin<Schema extends z.ZodType, Made = unknown>(name: string, definition: Definition<Schema, Made>): Plugin

### discover(modules: PluginModules): Plugin[]

### kernelPlugin(): HostPlugin

### mountPlugin(): HostPlugin

### routerPlugin(building: RouterOptions): HostPlugin

### start(starting: StartOptions): Promise<StartedApp>

### transportPlugin(settings: TransportOptions): HostPlugin

## Classes

### BootFault
    readonly code: BootFaultCode
    readonly plugin: string | undefined
    constructor(code: BootFaultCode, message: string, plugin?: string, cause?: unknown)

### Host
    constructor(say: LogLine, shared?: Wiring, who?: string)

### KernelFault
    readonly code: KernelFaultCode
    readonly plugin: string | undefined
    readonly detail: Readonly<Record<string, unknown>>
    constructor(code: KernelFaultCode, message: string, about?: KernelFaultDetail)

### RunningApp
    constructor(host: Host, plugins: readonly HostPlugin[])

## Types

### BootFaultCode
    "NO_NAME" | "NO_BOOT" | "REGISTERED_TWICE" | "UNKNOWN_NEED" | "CYCLE" | "NOT_BOOTING" | "OFFERED_TWICE" | "NO_API"

### cache
        Cache
        NAME
        Queries
        from
        fromQueries

### Cache
    invalidate: (key: readonly unknown[]) => void

### CallOptions
    query?: Readonly<Record<string, string | number | boolean | null | undefined>> | undefined
    body?: unknown
    headers?: Readonly<Record<string, string>> | undefined
    signal?: AbortSignal | undefined

### Command
    describe: string
    schema: z.ZodType
    requires?: readonly string[] | undefined
    run: (input: unknown, ctx: Context) => void | Promise<void>

### Context
    name: string
    config: Config
    services: Services
    log: Logger
    http: HttpClient
    cache: Cache
    realtime: Realtime
    events: { emit: (event: string, payload: unknown) => void; on: (event: string, handle: (payload: unknown) => void) => () => void; }
    hooks: { run: (hook: string, payload: unknown) => Promise<string | undefined>; }
    permissions: { has: (permission: string) => boolean; all: (permissions: readonly string[]) => boolean; changed: () => void; watch: (notify: () => void) => () => void; }
    commands: { run: (command: string, input: unknown) => Promise<void>; }
    use: <Api>(plugin: string) => Api

### ContractProblem
    code: KernelFault["code"]
    plugin: string
    message: string

### Definition
    describe: string
    version: string
    dependsOn?: readonly string[] | undefined
    config?: Schema | undefined
    permissions?: Readonly<Record<string, Permission>> | undefined
    grants?: ((ctx: Context<z.infer<Schema>, Given<Services>>) => readonly string[]) | undefined
    services?: ((ctx: Context<z.infer<Schema>, never>) => Services) | undefined
    fallback?: ComponentType<FallbackProps> | undefined
    frame?: FunctionComponent | undefined
    pages?: Pages | undefined
    routes?: readonly Route<z.infer<Schema>, Given<Services>>[] | undefined
    slots?: Readonly<Record<string, Slot>> | undefined
    contributes?: readonly SlotContribution[] | undefined
    emits?: Readonly<Record<string, Event>> | undefined
    listens?: Readonly<Record<string, Listener<Context<z.infer<Schema>, Given<Services>>>>> | undefined
    hooks?: Readonly<Record<string, Hook>> | undefined
    participates?: Readonly<Record<string, Participant<Context<z.infer<Schema>, Given<Services>>>>> | undefined
    commands?: Readonly<Record<string, Command<Context<z.infer<Schema>, Given<Services>>>>> | undefined
    sends?: ((ctx: Context<z.infer<Schema>, Given<Services>>) => Readonly<Record<string, string>>) | undefined
    setup?: ((ctx: Context<z.infer<Schema>, Given<Services>>) => void | Promise<void>) | undefined
    teardown?: ((ctx: Context<z.infer<Schema>, Given<Services>>) => void | Promise<void>) | undefined

### Describable
    describe: string

### DescribableWithSchema
    describe: string
    schema: z.ZodType

### Event
    describe: string
    schema: z.ZodType

### FallbackProps
    error: unknown
    plugin: string
    reset: () => void

### Hook
    describe: string
    schema: z.ZodType

### HostPlugin
    name: string
    needs?: readonly string[]
    boot: (host: Host) => void
    start?: (host: Host) => void | Promise<void>
    stop?: (host: Host) => void | Promise<void>

### HttpClient
    get: (path: string, request?: CallOptions) => Promise<unknown>
    post: (path: string, request?: CallOptions) => Promise<unknown>
    put: (path: string, request?: CallOptions) => Promise<unknown>
    patch: (path: string, request?: CallOptions) => Promise<unknown>
    delete: (path: string, request?: CallOptions) => Promise<unknown>

### Kernel
    start: () => Promise<void>
    stop: () => Promise<void>
    started: () => boolean
    routes: () => readonly RegisteredRoute[]
    frame: () => FunctionComponent | undefined
    pages: () => Pages
    slot: (name: string, payload: unknown) => { contributions: readonly MountedContribution[]; payload: unknown; problem?: string; }
    knownSlot: (name: string) => boolean
    fallbackFor: (plugin: string) => ComponentType<FallbackProps> | undefined
    context: (plugin: string) => Context
    permissions: { has: (permission: string) => boolean; all: (permissions: readonly string[]) => boolean; changed: () => void; watch: (notify: () => void) => () => void; }
    events: { failures: () => readonly ListenerFailure[]; }
    run: (command: string, input: unknown) => Promise<void>
    sent: () => Readonly<Record<string, string>>

### KernelFaultCode
    "DUPLICATE_PLUGIN" | "UNKNOWN_DEPENDENCY" | "DEPENDENCY_CYCLE" | "INVALID_NAME" | "INVALID_CONFIG" | "INVALID_ROUTE" | "INVALID_PAYLOAD" | "INVALID_CONTRIBUTION" | "UNDECLARED_EVENT" | "UNDECLARED_HOOK" | "UNDECLARED_SLOT" | "UNDECLARED_COMMAND" | "UNDECLARED_PERMISSION" | "UNDECLARED_DEPENDENCY" | "DUPLICATE_ROUTE" | "DUPLICATE_SLOT" | "DUPLICATE_EVENT" | "DUPLICATE_HOOK" | "DUPLICATE_COMMAND" | "DUPLICATE_PERMISSION" | "DUPLICATE_GRANTS" | "UNGRANTABLE_PERMISSION" | "DUPLICATE_HEADER" | "DUPLICATE_FRAME" | "DUPLICATE_PAGE" | "PERMISSION_DENIED" | "NOT_STARTED"

### KernelOptions
    plugins: readonly Plugin[]
    config?: Readonly<Record<string, unknown>>
    http?: HttpClient
    cache?: Cache
    realtime?: Realtime
    permissions?: PermissionSource
    log?: LogFn

### Listener
    who: string
    run: (payload: unknown) => void

### ListenerFailure
    event: string
    plugin: string
    error: unknown
    at: number

### LogFn
    (level: "debug" | "info" | "warn" | "error", plugin: string, line: string, about?: Readonly<Record<string, unknown>>) => void

### Logger
    debug: (line: string, about?: Readonly<Record<string, unknown>>) => void
    info: (line: string, about?: Readonly<Record<string, unknown>>) => void
    warn: (line: string, about?: Readonly<Record<string, unknown>>) => void
    error: (line: string, about?: Readonly<Record<string, unknown>>) => void

### LogLine
    (line: string, about?: Readonly<Record<string, unknown>>) => void

### MountedContribution
    slot: string
    order?: number | undefined
    requires?: readonly string[] | undefined
    render: ComponentType<{ payload: unknown; }>
    plugin: string

### Participant
    describe: string
    handle: (payload: unknown, ctx: Context) => string | undefined | Promise<string | undefined>

### Permission
    describe: string

### PermissionSource
    granted: () => readonly string[]

### Plugin
    name: string
    definition: Definition

### PluginModules
    default?: Plugin

### Realtime
    channel: () => "ws" | "http"
    subscribe: (channel: string, receive: (message: unknown) => void) => { close: () => void; }

### RegisteredRoute
    path: string
    component: ComponentType
    title: string
    requires?: readonly string[] | undefined
    search?: z.ZodType | undefined
    instead?: ((ctx: Context<Config, Services>) => string | undefined) | undefined
    plugin: string
    fallback: ComponentType<FallbackProps> | undefined

### Route
    path: string
    component: ComponentType
    title: string
    requires?: readonly string[] | undefined
    search?: z.ZodType | undefined
    instead?: ((ctx: Context<Config, Services>) => string | undefined) | undefined

### router
        Child
        Frame
        NAME
        Root
        Router
        RouterOptions
        from

### Slot
    DescribableWithSchema

### StartedApp
    kernel: Kernel
    http: HttpClient
    realtime: Realtime
    channel: "ws" | "http"
    stop: () => Promise<void>

### StartOptions
    plugins: readonly Plugin[]
    transport: TransportOptions
    config?: Readonly<Record<string, unknown>> | undefined
    permissions?: PermissionSource | undefined
    log?: Logger | undefined
    cache?: Cache | undefined

### transport
        Channel
        HttpMethod
        HttpRequest
        NAME
        Socket
        Subscription
        Transport
        TransportFault
        TransportFaultCode
        TransportOptions
        address
        from

# @onetype/stack-app-kit/react

## Functions

### KernelProvider({ kernel, children }: { kernel: Kernel; children: ReactNode; }): ReactNode

### NotFound(): ReactNode

### RouteGuard({ route, send }: { route: RegisteredRoute; send?: (to: string) => ReactNode; }): ReactNode

### Slot({ name, payload }: { name: string; payload?: unknown; }): ReactNode

### StartupFailure({ message }: StartupFailureProps): ReactNode

### StatusPageProvider({ pages, children }: { pages: Partial<StatusPages>; children: ReactNode; }): ReactNode

### useEvent(plugin: string, event: string, handle: (payload: unknown) => void): void

### useFrame(): FunctionComponent

### useKernel(): Kernel

### usePlugin<Config = unknown, Services = unknown>(name: string): PluginHandle<Config, Services>

### useStore<Value>(watch: (notify: () => void) => () => void, read: () => Value): Value

## Types

### PluginHandle
    Context<Config, Services>

### StartupFailureProps
    message: string

### StatusPages
    forbidden: ComponentType<{ permission?: string | undefined; }>
    missing: ComponentType<{ path?: string | undefined; }>

### useDismiss
    (open: boolean, inside: RefObject<HTMLElement | null>, anchor: RefObject<HTMLElement | null> | undefined, onDismiss: () => void) => void

### useEventCallback
    <Args extends readonly unknown[]>(handler: (...args: Args) => void) => ((...args: Args) => void)

### useFocusTrap
    (active: boolean, ref: RefObject<HTMLElement | null>) => void

# @onetype/stack-app-kit/testing

## Functions

### fakeContext<Config = unknown, Services = unknown>(answers?: Answers, faking?: Faking<Config>): Fake<Config, Services>

### findComments(source: string): Commented[]

### findDanglingPaths(root: string, files?: readonly string[]): DanglingPath[]

### findImportViolations(root: string): ImportViolation[]

### findLiterals(root: string, alsoIn?: readonly string[]): Literal[]

### findMissingDocs(root: string, required: readonly string[]): string[]

### findOversizedDocs(root: string, limit?: number): OversizedDoc[]

### findPrivateComments(source: string, dist: string): PrivateComment[]

### findShadowedExports(root: string): ShadowedExport[]

### findSharedNames(root: string): DuplicateSignature[]

### findSharedVocabulary(root: string): DuplicateSignature[]

### findSplitVocabulary(root: string): SplitVocabulary[]

### findUndocumentedKeys(contract: string, procedure: string): string[]

### findUnexplainedPlugins(plugins: string): string[]

### findUnknownClasses(root: string): UnknownClass[]

### findUnknownTokens(root: string): UnknownToken[]

### findUnmeasured(root: string, alsoIn?: readonly string[]): Unmeasured[]

### findUnusedFields(root: string): UnusedField[]

### findUnwatched(root: string): Unwatched[]

## Types

### Answers
    Readonly<Record<string, unknown>>

### Commented
    file: string
    line: number

### DanglingPath
    alias: string
    target: string
    file: string

### DuplicateSignature
    signature: string
    plugins: readonly string[]
    files: readonly string[]

### EmittedEvent
    event: string
    payload: unknown

### Fake
    ctx: Context<Config, Services>
    asked: readonly FakeRequest[]
    announced: readonly EmittedEvent[]
    invalidated: readonly (readonly unknown[])[]
    commanded: readonly RanCommand[]
    logged: readonly { level: string; line: string; }[]
    regranted: number
    refusal: string | undefined
    push: (channel: string, message: unknown) => void

### FakeRequest
    method: string
    path: string
    query?: Readonly<Record<string, unknown>> | undefined
    body?: unknown
    headers?: Readonly<Record<string, string>> | undefined

### FakeResponse
    status: number
    body?: unknown

### Faking
    name?: string
    config?: Config
    services?: unknown
    permissions?: readonly string[]
    refusal?: string | undefined
    offering?: Readonly<Record<string, unknown>>

### ImportEdge
    from: string
    to: string
    specifier: string

### ImportViolation
    rule: "undeclared" | "deep" | "cycle" | "contract" | "twice"
    message: string

### OversizedDoc
    path: string
    size: number

### PrivateComment
    file: string
    line: number
    sentence: string

### Project
    required: readonly ["#docs/usage.md", "#docs/stack.md", "#docs/architecture.md"]
    findAll: (checking?: ProjectCheckOptions) => ProjectProblem[]
    findSkipped: (checking?: ProjectCheckOptions) => ProjectSkipped[]

### ProjectCheckOptions
    root?: string
    plugins?: string
    utils?: string
    docs?: string
    required?: readonly string[]
    limit?: number
    styleIn?: readonly string[]
    sharing?: readonly string[]
    shadowing?: readonly string[]
    apart?: readonly string[]
    across?: readonly string[]
    budgets?: Readonly<Record<string, number>>

### ProjectProblem
    check: "boundaries" | "wiring" | "unexplained" | "token" | "class" | "comment" | "literal" | "oversized" | "missing" | "dangling" | "twice" | "budget" | "split" | "shadowed"
    message: string

### ProjectSkipped
    check: string
    message: string

### RanCommand
    command: string
    input: unknown

### ShadowedExport
    plugin: string
    component: string
    owner: string
    file: string

### SplitVocabulary
    name: string
    plugins: readonly string[]
    files: readonly string[]
    shared: readonly string[]
    apart: readonly string[]

### UndocumentedKey
    key: string

### UnknownClass
    file: string
    name: string

### UnknownToken
    file: string
    token: string

### Unmeasured
    file: string
    holds: number

### UnusedField
    file: string
    shape: string
    field: string

### Unwatched
    file: string
    shape: string

