# VoteReady (civic-vote-app)

A voter information web app built on the Google Civic Information API, deployed on Netlify with no database.

## Docs
- [Product Requirements Document](docs/VoteReady_PRD.pdf)
- [Google Civic Information API Overview](docs/Google_Civic_API_Overview.pdf)

## Planned stack
- Static frontend on Netlify
- Netlify Functions as an API proxy (keeps `CIVIC_API_KEY` and `ANTHROPIC_API_KEY` secret)
- Browser localStorage for saved plans (no database)
