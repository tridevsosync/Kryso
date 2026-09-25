<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep the Kryso website frontend-only: use React local state and mock JavaScript data without adding backend services, because the supplied brief explicitly excludes them.
- Use TanStack file-based routing and TypeScript in this project rather than the brief's React Router/JavaScript suggestion, because the existing Lovable stack is fixed.
