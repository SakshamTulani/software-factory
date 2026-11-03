import { formatDateTime } from "@/shared/lib/format"
import { Button } from "@/shared/ui/button"

import { useCanSendCommand } from "../hooks/useCanSendCommand"
import { useCommandHistory } from "../hooks/useCommandHistory"
import { useSendCommand } from "../hooks/useSendCommand"
import { useVehicleCommandsQuery } from "../hooks/useVehicleCommandsQuery"
import { useVehicleDetailsQuery } from "../hooks/useVehicleDetailsQuery"
import { VehicleStatusBadge } from "./VehicleStatusBadge"

type Props = { fleetId: string; vehicleId: string }

export function CommandPanel({ fleetId, vehicleId }: Props) {
  const vehicle = useVehicleDetailsQuery(fleetId, vehicleId)
  const commands = useVehicleCommandsQuery(fleetId, vehicleId)
  const history = useCommandHistory(fleetId, vehicleId)
  const canSend = useCanSendCommand(fleetId, vehicleId)
  const send = useSendCommand()

  if (commands.isPending) return <p className="text-muted-foreground">Loading commands…</p>
  if (commands.error) {
    return (
      <p role="alert">
        Couldn't load commands.{" "}
        <Button variant="link" onClick={() => commands.refetch()}>
          Try again
        </Button>
      </p>
    )
  }

  return (
    <section aria-label="Commands" className="flex flex-col gap-4">
      <header className="flex flex-wrap items-baseline gap-3">
        <h2 className="font-semibold text-lg">{vehicle.data?.regNo ?? vehicleId}</h2>
        <VehicleStatusBadge fleetId={fleetId} vehicleId={vehicleId} />
        {vehicle.data?.lastCommandAt && (
          <span className="text-muted-foreground">
            Last command {formatDateTime(vehicle.data.lastCommandAt)}
          </span>
        )}
      </header>

      <div className="flex flex-wrap gap-2">
        {commands.data?.map((command) => (
          <Button
            key={command.id}
            disabled={!canSend || send.isPending}
            onClick={() =>
              send.mutate({ fleetId, vehicleId, commandId: command.id, validTill: null })
            }
          >
            {command.name}
          </Button>
        ))}
      </div>
      {send.error && <p role="alert">Couldn't send the command. Try again.</p>}

      {/* No refresh code: CommandStore invalidates history; VehicleStore hears command/sent. */}
      <ol aria-label="History" className="flex flex-col gap-1">
        {history.items.map((item) => (
          <li key={`${item.commandId}-${item.sentAt.getTime()}`}>
            {item.commandName} · {item.status} · {formatDateTime(item.sentAt)}
          </li>
        ))}
      </ol>
    </section>
  )
}
