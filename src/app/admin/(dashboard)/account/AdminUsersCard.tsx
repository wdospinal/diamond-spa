import type { AdminAccountSummary } from '@/lib/admin-users'

/**
 * Listado de las cuentas del panel. Es un componente de servidor: los datos ya
 * llegan resueltos y no hay nada interactivo, así que no cruza al cliente.
 */
export default function AdminUsersCard({
  accounts,
  currentUser,
  error,
}: {
  accounts: AdminAccountSummary[]
  currentUser: string
  error?: boolean
}) {
  return (
    <div className="bg-surface-container border border-outline-variant/20 p-6 rounded-lg max-w-3xl">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-primary" aria-hidden="true">person</span>
        </div>
        <div>
          <h2 className="font-headline text-xl text-on-surface mb-1">Usuarios del panel</h2>
          <p className="text-sm text-on-surface/60 leading-relaxed">
            Quién puede entrar y con qué correo. Todas las cuentas tienen los mismos permisos.
          </p>
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 text-sm text-error bg-error/10 border border-error/20 p-3 rounded font-body"
        >
          <span className="material-symbols-outlined text-lg shrink-0" aria-hidden="true">error</span>
          <span>No se pudo leer la lista de cuentas.</span>
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body border-collapse">
            <thead>
              <tr className="text-left border-b border-outline-variant/20">
                <th className="font-label text-[11px] text-on-surface/60 uppercase tracking-widest pb-3 pr-4">
                  Usuario
                </th>
                <th className="font-label text-[11px] text-on-surface/60 uppercase tracking-widest pb-3 pr-4">
                  Correo
                </th>
                <th className="font-label text-[11px] text-on-surface/60 uppercase tracking-widest pb-3">
                  Contraseña
                </th>
              </tr>
            </thead>
            <tbody>
              {accounts.map(account => (
                <tr key={account.username} className="border-b border-outline-variant/10 last:border-0">
                  <td className="py-3 pr-4 text-on-surface whitespace-nowrap">
                    {account.username}
                    {account.username === currentUser ? (
                      <span className="ml-2 font-label text-[10px] uppercase tracking-widest text-primary">
                        tú
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 pr-4 text-on-surface/70 break-all">
                    {account.email ?? <span className="text-on-surface/40">Sin asociar</span>}
                    {account.pendingEmail ? (
                      <span className="block text-xs text-on-surface/40 mt-0.5">
                        cambio en curso a {account.pendingEmail}
                      </span>
                    ) : null}
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    {account.hasOwnPassword ? (
                      <span className="font-label text-[10px] uppercase tracking-widest text-[#34d399]">
                        Propia
                      </span>
                    ) : (
                      <span
                        className="font-label text-[10px] uppercase tracking-widest text-on-surface/45"
                        title="Sigue usando la contraseña inicial del entorno"
                      >
                        Inicial
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
