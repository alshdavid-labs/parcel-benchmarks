# Parcel Benchmarks

This will run benchmarks for Parcel, by default using the three-js fixture.

You can configure the number of three-js copies and whether it uses static or dynamic imports.

It will generate a visual graph and csv file with the results of the benchmark

# Setup

Install:

- [procmon](https://github.com/alshdavid/procmon)
- [just](https://github.com/casey/just)

```bash
git clone git@github.com:alshdavid-labs/parcel-benchmarks.git
cd parcel-benchmarks
```

# Run a benchmark

```bash
just generate 10 sync
just generate 10 dynamic

yarn install

just run
ls -l ./reports
```

# Using a local copy of Parcel

You can link a local copy of Parcel using the included link script

```bash
export PARCEL_SRC_PATH="/path/to/parcel/sources"

just generate 10 sync
just generate 10 dynamic

yarn install
just link

just run
ls -l ./reports
```

# Sharing Results

Create a [discussion thread](https://github.com/alshdavid-labs/parcel-benchmarks/discussions) and post your graphs there.

Make sure you add details like your hardware, the Parcel branch you are using and other important information.
