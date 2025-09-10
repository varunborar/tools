"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy } from "lucide-react"

function useBase64() {
	const [input, setInput] = React.useState("")
	const [output, setOutput] = React.useState("")
	const [copied, setCopied] = React.useState(false)

	const handleCopy = React.useCallback(async () => {
		try {
			await navigator.clipboard.writeText(output)
			setCopied(true)
			setTimeout(() => setCopied(false), 1200)
		} catch {}
	}, [output])

	return { input, setInput, output, setOutput, copied, handleCopy }
}

function Base64Content() {
	const [tab, setTab] = React.useState("encode")
	const encodeState = useBase64()
	const decodeState = useBase64()

	const doEncode = React.useCallback(() => {
		try {
			const result = btoa(unescape(encodeURIComponent(encodeState.input)))
			encodeState.setOutput(result)
		} catch (e) {
			encodeState.setOutput("")
		}
	}, [encodeState.input])

	const doDecode = React.useCallback(() => {
		try {
			const result = decodeURIComponent(escape(atob(decodeState.input)))
			decodeState.setOutput(result)
		} catch (e) {
			decodeState.setOutput("")
		}
	}, [decodeState.input])

	return (
		<div className="mx-auto w-full max-w-2xl p-4">
			<Card>
				<CardHeader>
					<CardTitle>Base64</CardTitle>
					<CardDescription>Encode and decode Base64 text.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<Tabs value={tab} onValueChange={setTab}>
						<TabsList>
							<TabsTrigger value="encode">Encode</TabsTrigger>
							<TabsTrigger value="decode">Decode</TabsTrigger>
						</TabsList>

						<TabsContent value="encode" className="space-y-4">
							<div className="flex flex-col gap-2">
								<label className="text-sm">Input</label>
								<Textarea
									placeholder="Enter text to encode"
									value={encodeState.input}
									onChange={(e) => encodeState.setInput(e.target.value)}
									aria-label="Text to encode"
								/>
							</div>
							<div className="flex gap-2">
								<Button type="button" onClick={doEncode}>Encode</Button>
								<Button type="button" variant="outline" onClick={() => { encodeState.setInput(""); encodeState.setOutput("") }}>Clear</Button>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm">Output</label>
								<Input value={encodeState.output} readOnly className="font-mono" placeholder="Base64 output will appear here" aria-label="Encoded output" />
								<Button type="button" variant="outline" size="icon" onClick={encodeState.handleCopy} disabled={!encodeState.output} aria-label="Copy encoded output">
									<Copy />
								</Button>
							</div>
						</TabsContent>

						<TabsContent value="decode" className="space-y-4">
							<div className="flex flex-col gap-2">
								<label className="text-sm">Input</label>
								<Textarea
									placeholder="Enter Base64 to decode"
									value={decodeState.input}
									onChange={(e) => decodeState.setInput(e.target.value)}
									aria-label="Text to decode"
								/>
							</div>
							<div className="flex gap-2">
								<Button type="button" onClick={doDecode}>Decode</Button>
								<Button type="button" variant="outline" onClick={() => { decodeState.setInput(""); decodeState.setOutput("") }}>Clear</Button>
							</div>
							<div className="flex flex-col gap-2">
								<label className="text-sm">Output</label>
								<Textarea value={decodeState.output} readOnly className="font-mono" placeholder="Decoded text will appear here" aria-label="Decoded output" />
								<Button type="button" variant="outline" size="icon" onClick={decodeState.handleCopy} disabled={!decodeState.output} aria-label="Copy decoded output">
									<Copy />
								</Button>
							</div>
						</TabsContent>
					</Tabs>
				</CardContent>
				<CardFooter>
					<div className="text-xs text-muted-foreground">UTF-8 safe Base64 using btoa/atob.</div>
				</CardFooter>
			</Card>
		</div>
	)
}

export default function Base64Page() {
	return (
		<React.Suspense fallback={<div className="p-4 text-sm opacity-70">Loading…</div>}>
			<Base64Content />
		</React.Suspense>
	);
}
