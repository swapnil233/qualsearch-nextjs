<h1> Streamlined Qualitative UX Research With the Power of AI </h1>

![screely-1706073813508](https://github.com/swapnil233/qualsearch-nextjs/assets/36313876/e31e8a5b-9384-4ca3-aff5-289903295c7a)

![www qualsearch io_teams_clqvj9lk50004oop5p8pux1f7_projects_clqvj9r6s0006oop5n9pz0t6d_files_clr10dwkw000113qhnjbrml27(MacBook Air)](https://github.com/swapnil233/qualsearch-nextjs/assets/36313876/255492f3-a7d3-4df6-998c-b80c880e3e49)

![screely-1706074195598](https://github.com/swapnil233/qualsearch-nextjs/assets/36313876/03bd1461-b67c-4b07-852d-f7e230d9390c)

![screely-1706074101291](https://github.com/swapnil233/qualsearch-nextjs/assets/36313876/4567db48-3555-4273-b5f7-b3a30ab1d824)

## How AI-generated summaries are created

<img width="1865" alt="TC Architecture" src="https://github.com/swapnil233/next-transcriptions/assets/36313876/f9e9f178-4b15-4c4f-a5d0-b6858e117b04">

#### How to run on your machine:

1. `git clone https://github.com/swapnil233/next-transcriptions.git`
2. `npm install` to get all the dependencies
3. Get an instance of Postgres running and create a database, name it whatever (eg "transcriptions").
4. If you want to use Supabase to host the DB instead of your machine, make a DB in Supabase. The IPV6 connection strings will look like this (they can also be found in settings. The DB password will only be shown to you once upon creation):

- `DIRECT_URL="postgres://postgres.[YOUR-USERNAME]:[YOUR-DB-PASSWORD]@aws-0-ca-central-1.pooler.supabase.com:5432/postgres"`
- `DATABASE_URL="postgres://postgres.[YOUR-USERNAME]:[YOUR-DB-PASSWORD]@aws-0-ca-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"`

5. Create a `.env` file, and populate it with the data that's required, which is found in `.env.example`
6. Run `npx prisma generate` and `npx prisma db push` to upload the schema into your DB and generate the types for the DB models.
7. Run `npm run dev` to start the nextjs project on port 3003 (you can change this in `package.json` under the `dev` script)
