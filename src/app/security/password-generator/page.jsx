"use client"

import * as React from "react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import { usePasswordGenerator } from "@/hooks/security/use-password-generator"
import { useActions } from "@/contexts/actions"

function PasswordGeneratorContent() {
    const {
        password,
        copied,
        length,
        includeUppercase,
        includeLowercase,
        includeNumbers,
        includeSymbols,
        history,
        setLength,
        setIncludeUppercase,
        setIncludeLowercase,
        setIncludeNumbers,
        setIncludeSymbols,
        regenerate,
        handleCopy,
        copyFromHistory,
        clearHistory,
    } = usePasswordGenerator()

    const { setActions } = useActions()

    const actions = React.useMemo(() => ([
        { key: "copy", label: copied ? "Copied" : "Copy", variant: "outline", size: "sm", onClick: handleCopy, disabled: !password },
        { key: "regenerate", label: "Regenerate", size: "sm", onClick: regenerate },
        { key: "clear-history", label: "Clear history", variant: "destructive", size: "sm", onClick: clearHistory, disabled: history.length === 0 },
    ]), [copied, handleCopy, regenerate, password, clearHistory, history.length])

    React.useEffect(() => {
        setActions(actions)
        return () => setActions([])
    }, [actions, setActions])

    return (
        <div className="mx-auto w-full max-w-2xl p-4">
            <Card>
                <CardHeader>
                    <CardTitle>Password Generator</CardTitle>
                    <CardDescription>Create a strong, random password with your preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="generated-password">Generated password</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="generated-password"
                                value={password}
                                readOnly
                                placeholder="Your password will appear here"
                                className="font-mono"
                                aria-label="Generated password"
                            />
                            <Button type="button" variant="outline" size="icon" onClick={handleCopy} disabled={!password} aria-label="Copy password">
                                <Copy />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="length">Length</Label>
                            <div className="text-sm tabular-nums text-muted-foreground" aria-live="polite">{length}</div>
                        </div>
                        <Slider
                            id="length"
                            min={4}
                            max={64}
                            value={[length]}
                            onValueChange={(vals) => setLength(vals[0])}
                            aria-label="Password length"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <label className="flex items-center gap-3">
                            <Checkbox checked={includeUppercase} onCheckedChange={(v) => setIncludeUppercase(Boolean(v))} />
                            <span className="text-sm">Include uppercase (A–Z)</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <Checkbox checked={includeLowercase} onCheckedChange={(v) => setIncludeLowercase(Boolean(v))} />
                            <span className="text-sm">Include lowercase (a–z)</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <Checkbox checked={includeNumbers} onCheckedChange={(v) => setIncludeNumbers(Boolean(v))} />
                            <span className="text-sm">Include numbers (0–9)</span>
                        </label>
                        <label className="flex items-center gap-3">
                            <Checkbox checked={includeSymbols} onCheckedChange={(v) => setIncludeSymbols(Boolean(v))} />
                            <span className="text-sm">Include symbols (!@#$…)</span>
                        </label>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Label>History</Label>
                                <div className="text-xs text-muted-foreground">Last {Math.min(5, history.length)} of 5</div>
                            </div>
                        </div>
                        {history.length === 0 ? (
                            <div className="text-sm opacity-70">No history yet</div>
                        ) : (
                            <ul className="flex flex-col gap-2">
                                {history.map((item, idx) => (
                                    <li key={`${item}-${idx}`} className="flex items-center gap-2">
                                        <Input value={item} readOnly className="font-mono" aria-label={`Previous password ${idx + 1}`} />
                                        <Button type="button" variant="outline" size="icon" onClick={() => copyFromHistory(item)} aria-label="Copy previous password">
                                            <Copy />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="text-xs text-muted-foreground">Uses secure randomness (window.crypto)</div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default function PasswordGeneratorPage() {
    return (
        <React.Suspense fallback={<div className="p-4 text-sm opacity-70">Loading…</div>}>
            <PasswordGeneratorContent />
        </React.Suspense>
    );
}