# Third-Party Licenses

Workbench is released under the MIT license (see [LICENSE](LICENSE)). It uses the following third-party software at runtime. Exact versions are pinned in `bun.lock`; development-only tools (build, lint, test) are not listed.

## Web app (`apps/web`, `packages/shared`)

| Component | Author | License | Source |
| --- | --- | --- | --- |
| React, React DOM | Meta Platforms, Inc. and affiliates | MIT | https://github.com/facebook/react |
| Radix UI Primitives (`@radix-ui/react-*`) | Radix UI contributors | MIT | https://github.com/radix-ui/primitives |
| Radix Icons | Radix UI contributors | MIT | https://github.com/radix-ui/icons |
| TanStack Query | Tanner Linsley | MIT | https://github.com/TanStack/query |
| React Hook Form, `@hookform/resolvers` | Beier Luo and contributors | MIT | https://github.com/react-hook-form/react-hook-form |
| Zod | Colin McDonnell | MIT | https://github.com/colinhacks/zod |
| Axios | Matt Zabriskie | MIT | https://github.com/axios/axios |
| i18next, react-i18next, i18next-browser-languagedetector, i18next-http-backend | Jan Mühlemann and contributors | MIT | https://github.com/i18next/i18next |
| Framer Motion | Framer B.V. | MIT | https://github.com/framer/motion |
| date-fns | Sasha Koss and Lesha Koss | MIT | https://github.com/date-fns/date-fns |
| react-day-picker | Giampaolo Bellavite | MIT | https://github.com/gpbl/react-day-picker |
| cmdk | Paco Coursey | MIT | https://github.com/pacocoursey/cmdk |
| Vaul | Emil Kowalski | MIT | https://github.com/emilkowalski/vaul |
| Lucide React | Lucide Contributors | ISC | https://github.com/lucide-icons/lucide |
| class-variance-authority | Joe Bell | Apache-2.0 | https://github.com/joe-bell/cva |
| clsx | Luke Edwards | MIT | https://github.com/lukeed/clsx |
| tailwind-merge | Dany Castillo | MIT | https://github.com/dcastil/tailwind-merge |
| tailwindcss-animate | Jamie Kyle | MIT | https://github.com/jamiebuilds/tailwindcss-animate |
| pulltorefreshjs | Rafael Soto | MIT | https://github.com/BoxFactura/pulltorefresh.js |

## API (`apps/api`)

| Component | Author | License | Source |
| --- | --- | --- | --- |
| Hono, `@hono/zod-openapi`, `@hono/swagger-ui` | Yusuke Wada and contributors | MIT | https://github.com/honojs |
| Drizzle ORM | Drizzle Team | Apache-2.0 | https://github.com/drizzle-team/drizzle-orm |
| jose | Filip Skokan | MIT | https://github.com/panva/jose |
| ms | Vercel, Inc. | MIT | https://github.com/vercel/ms |
| Zod | Colin McDonnell | MIT | https://github.com/colinhacks/zod |
| Swagger UI (loaded by `/docs` in development) | SmartBear Software | Apache-2.0 | https://github.com/swagger-api/swagger-ui |

UI components follow the patterns of [shadcn/ui](https://github.com/shadcn-ui/ui) (MIT).

The full license texts are available in each component's source repository and in its published npm package.
