/**
 * Deprecated legacy component. The active sign-in page is /signin and uses
 * BivoAuthCard through src/app/signin/page.tsx. This no-op module is retained
 * temporarily so ZIP-based updates overwrite stale copies in existing GitHub
 * branches and prevent obsolete code from being type-checked. It is not used
 * by any route and can be deleted once the old file is removed from the repo.
 */
export default function BivoSignInLegacy(): null {
  return null;
}
