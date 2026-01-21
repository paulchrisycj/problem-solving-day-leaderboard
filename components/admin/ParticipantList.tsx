'use client';

import { useState } from 'react';
import { Pencil, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAppContext } from '@/context/AppContext';
import { ParticipantEditDialog } from './ParticipantEditDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import type { Participant } from '@/types';

export function ParticipantList() {
  const { state } = useAppContext();
  const [editParticipant, setEditParticipant] = useState<Participant | null>(null);
  const [deleteParticipant, setDeleteParticipant] = useState<Participant | null>(null);

  const renderParticipantRow = (participant: Participant) => (
    <TableRow key={participant.id}>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="font-medium">{participant.name}</span>
          {participant.type === 'group' && (
            <Badge variant="outline" className="gap-1">
              <Users className="h-3 w-3" />
              {participant.members.length}
            </Badge>
          )}
        </div>
        {participant.type === 'group' && (
          <div className="text-xs text-muted-foreground mt-1">
            {participant.members.join(', ')}
          </div>
        )}
      </TableCell>
      <TableCell className="text-center">
        {participant.score !== null ? participant.score : '-'}
      </TableCell>
      <TableCell className="text-center">
        {participant.attempts}/2
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setEditParticipant(participant)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDeleteParticipant(participant)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <>
      <Tabs defaultValue="individuals">
        <TabsList className="w-full">
          <TabsTrigger value="individuals" className="flex-1">
            Individuals ({state.individuals.length})
          </TabsTrigger>
          <TabsTrigger value="groups" className="flex-1">
            Groups ({state.groups.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individuals">
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-20 text-center">Score</TableHead>
                  <TableHead className="w-24 text-center">Attempts</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.individuals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No individuals registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  state.individuals.map(renderParticipantRow)
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="groups">
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="w-20 text-center">Score</TableHead>
                  <TableHead className="w-24 text-center">Attempts</TableHead>
                  <TableHead className="w-24 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.groups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No groups registered yet
                    </TableCell>
                  </TableRow>
                ) : (
                  state.groups.map(renderParticipantRow)
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <ParticipantEditDialog
        participant={editParticipant}
        open={!!editParticipant}
        onOpenChange={(open) => !open && setEditParticipant(null)}
      />

      <DeleteConfirmDialog
        participant={deleteParticipant}
        open={!!deleteParticipant}
        onOpenChange={(open) => !open && setDeleteParticipant(null)}
      />
    </>
  );
}
