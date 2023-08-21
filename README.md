<h1> Transcription and summarization web application </h1>

<img width="1865" alt="TC Architecture" src="https://github.com/swapnil233/next-transcriptions/assets/36313876/f9e9f178-4b15-4c4f-a5d0-b6858e117b04">

#### How to run on your machine:

1. `git clone https://github.com/swapnil233/next-transcriptions.git`
2. `npm install` to get all the dependencies
3. Get an instance of Postgres running and create a database, name it whatever (eg "transcriptions").
4. If you want to use Supabase to host the DB instead of your machine, make a DB in Supabase, then go into settings and get the regular connection string and the connection string with PgBouncer. This needs to be done for connection pooling, because if you deploy to a serverless env like Vercel or AWS Amplify, every function invocation may result in a new connection to the database. The connection strings will look like this:

- `DIRECT_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"`
- `DATABASE_URL="postgres://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:6543/postgres?pgbouncer=true"`

5. Create a `.env` file, and populate it with the data that's required, which is found in `.env.example`
6. Run `npx prisma generate` and `npx prisma db push` to upload the schema into your DB and generate the TypeScript types for the schema models
7. Seed your database with categories and tags by running `npm run seed`
8. Run `npm run dev` to start the nextjs project on port 3003 (you can change this in `package.json` under the `dev` script)
