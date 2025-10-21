ALTER TABLE "HoursOfOperation"
    ALTER COLUMN "closeHour" TYPE INTEGER USING "closeHour"::integer,
    ALTER COLUMN "closeMinute" TYPE INTEGER USING "closeMinute"::integer;