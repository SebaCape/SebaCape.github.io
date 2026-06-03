## Why did I choose to build this?

I wanted to try my hand at building a project that would allow me to exercise techniques in data engineering and analysis, and I figured that tying this to my personal interest in quantitative finance would be fun. Naturally, a backtesting engine was the immediate obvious and impactful way
to do this, and it beared many opportunities for expressing my own systems level thinking, so it was very appealing. What followed was an iterative process of building an MVP, optimizing strategies and data analysis, and finally tying it to something tangible (which will be expanded upon later.)

### Architecture & Planning

Immediately, I knew that at minimum, a backtesting engine needs 3 components: A data pipeline, a strategy to execute, and some sort of insights; ideally with visualizations to better understand how to interpret a strat's performance.

So for an MVP, I wanted to build these features out and then figure out where to expand from there. Python is king when it comes to data engineering & analysis, and it also has a lot of support with its developer ecosystem via all of the packages one can import (one of which being yfinance, which was where I initially decided to get my stock data.) This would be used for the ETL, but then this transformed data needed to be processed and stored somewhere, so I chose DuckDB for a database, which proved to be very effective.

### 10x faster analytical queries with DuckDB!

If you are familiar with traditional relational databases like SQLite or MySQL, then having a database with queries 10x faster than this may sound crazy, but DuckDB achieves this in a way that is very clever.

DuckDB is a **columnar database**, meaning that data is stored in rows instead of traditional columns. This ensures that for analytical database queries (which are crucial for strategy evaluation on historical data in a backtester,) no excess data is read, as everything that is needed is in the columns. Combined with vectorized operations, this made DuckDB a great choice for a project like this as opposed to more popular relational databases.

Combined with the strategy calculations themselves, this also made visualization faster as a result, since all of the data is being pipelined from this source anyways. From this point, I was able to implement some different indicators on my visualization, such as suggested buy and sell orders based on a simple moving average crossover strategy used as a placeholder. Additionally, I wrote some PNL metrics like NAV and compared whatever stock was being analyzed against a SPY and chosen stock buy and hold benchmark, so you could adequately see if your strategy would have outperformed the most basic investments.

With this, an MVP was complete. You could run the ETL script, and it would take user input for which stock ticker you would like to process (was initially restricted to just AAPL, but that is silly so it was later made ticker agnostic.) From there, you could run a visualization and see the results of the default moving average crossover strategy operating on the past 5 years of stock data. However, I wanted to do more with this, and eventually got to an end result that I thought was pretty cool. Soon after, I wrote some unit tests and did some debugging to prepare to continue building out functionality.

### Moving beyond the MVP with more strategies

Now, I am most definitely more of a developer than a trained financial strategist, but I still wanted to add more strategies to the engine because it would allow me to create more modularity with how strategies could be implemented in the future, and it would also be cool to see the performance of something that wasn't a simple moving average crossover.

I settled on implementing another strategy with Bollinger Bands & mean reversion, with RSI validation. A laymans explanation is the following: Bollinger Bands essentially check if an asset's market value is within 2 standard deviations of the moving mean over some set period (standard is 20 days.) If it falls out of it, depending on whether grossly above or below the mean, the strategy informs sell or buy orders respectively based on this, since stocks are very unlikely to remain outside of their statistical average for an extended period of time. The RSI (Relative Strength Index) component is essentially just a sanity check, that determines whether a stock is under or overvalued, to prevent premature orders on particularly strong uptrends or downtrends of value.

This strategy performed better than the standard crossover strategy on a good portion of unique historical stock data, which was exactly the type of change I was looking for, so this satisfied me. However one thing came to mind: what if I could see how this performed on the realtime market?

### Migrating to Alpaca Markets & automating paper trades

Through some research, I discovered that Alpaca Markets not only has a free API for financial data and trading, but they also allow users to open a paper trading account with no cost! I signed up for this, and started looking into documentation, before migrating the entire engine from yfinance to Alpaca. After verifying core functionality was intact, it was all about now adding brokerage logic to enact trades on some users Alpaca trading account based on user configurations.

From here, automation is simple, with a straightforward scheduler script that I wrote in Python which will now check if markets were open, and operate hourly, testing whether the strategy informs trades or not and making market decisions accordingly. Not only had I written my first backtesting engine, but by extension I was able to create my own algotrader on top of it! (I actually have an instance of the automated algo trader running on my Alpaca instance right now, and the orders work properly which is a relief.)

### Reflection

Overall, I was pretty happy with this project. By no means do I think it is groundbreaking from a financial research perspective, but that is ok since this entire experience was more to practice adequate unit testing, data plumbing and pipelining, and building a tool end to end that could be modularly expanded and used by other people. In the future it would be interesting to take a more trade specific route, and possibly build something that is higher frequency, as HFT as a field is very interesting for me personally.

If you are interested in checking it out your self, all of my code is publically accessible (and open source under MIT license) on my github at [this link.](https://github.com/SebaCape/sebafinc)

That is all I have to say about this post. If you want to learn more or have any ideas to share regarding it, do feel free to reach out to me via my contact info elsewhere on this website. Have a great day!