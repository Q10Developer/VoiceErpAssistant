import React, { useState, useEffect, useRef } from "react";
import { Mic, Square, Check, Server, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";

// A completely standalone control panel that doesn't depend on any context
const SimpleControls = () => {
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Speech recognition and synthesis
  const recognitionRef = useRef<any>(null);
  const speechSynthesisRef = useRef<SpeechSynthesis | null>(null);
  
  // Initialize speech recognition and synthesis
  useEffect(() => {
    // Browser compatibility check for SpeechRecognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    // Initialize speech synthesis
    if (window.speechSynthesis) {
      speechSynthesisRef.current = window.speechSynthesis;
      
      // Preload voices
      if (speechSynthesisRef.current.onvoiceschanged !== undefined) {
        speechSynthesisRef.current.onvoiceschanged = () => {
          console.log("Voices loaded:", speechSynthesisRef.current?.getVoices().length);
        };
      }
      
      // Force voices to load
      speechSynthesisRef.current.getVoices();
    } else {
      console.error('Speech synthesis not supported in this browser');
    }
    
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log("Final transcript:", transcript);
          } else {
            interimTranscript += transcript;
            console.log("Interim transcript:", transcript);
          }
        }
        
        // Update input field with transcript
        if (finalTranscript) {
          console.log("Setting input text to final transcript:", finalTranscript);
          setInputText(finalTranscript);
          setTranscript(finalTranscript);
        } else if (interimTranscript) {
          console.log("Setting transcript to interim:", interimTranscript);
          setTranscript(interimTranscript);
          // Also update the input field in real-time so users see what's being recognized
          setInputText(interimTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        console.log('Speech recognition ended');
        setIsRecording(false);
      };
    } else {
      console.error('Speech recognition not supported in this browser');
    }
    
    // Cleanup
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);
  
  // Start speech recognition
  const startRecording = () => {
    try {
      // Clear any previous results
      setResult("");
      setTranscript("");
      
      // Check for browser support again just to be safe
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setResult("Speech recognition is not supported in your browser. Please try Chrome or Edge.");
        return;
      }
      
      // If we need to create a new recognition object
      if (!recognitionRef.current) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';
        
        recognitionRef.current.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
              console.log("Final transcript:", transcript);
            } else {
              interimTranscript += transcript;
              console.log("Interim transcript:", transcript);
            }
          }
          
          // Update input field with transcript
          if (finalTranscript) {
            console.log("Setting input text to final transcript:", finalTranscript);
            setInputText(finalTranscript);
            setTranscript(finalTranscript);
          } else if (interimTranscript) {
            console.log("Setting transcript to interim:", interimTranscript);
            setTranscript(interimTranscript);
            // Also update the input field in real-time so users see what's being recognized
            setInputText(interimTranscript);
          }
        };
        
        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          if (event.error === 'no-speech') {
            setResult("No speech detected. Please try speaking louder or check your microphone.");
          } else if (event.error === 'audio-capture') {
            setResult("No microphone detected. Please connect a microphone and try again.");
          } else if (event.error === 'not-allowed') {
            setResult("Microphone access denied. Please allow microphone access in your browser settings.");
          } else {
            setResult(`Speech recognition error: ${event.error}`);
          }
          setIsRecording(false);
        };
        
        recognitionRef.current.onend = () => {
          console.log('Speech recognition ended');
          setIsRecording(false);
        };
      }
      
      console.log("Starting speech recognition...");
      recognitionRef.current.start();
      setIsRecording(true);
      
      // Show user a message
      setResult("Listening...");
      
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setResult(`Error starting speech recognition: ${(error as Error).message}`);
      setIsRecording(false);
    }
  };
  
  // Stop speech recognition
  const stopRecording = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        setIsRecording(false);
        
        // Process the command if we have a transcript
        if (transcript) {
          setInputText(transcript);
          setTimeout(() => {
            processCommand();
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error stopping speech recognition:', error);
      setIsRecording(false);
    }
  };
  
  // Simple direct API call without using contexts
  const processCommand = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    setResult("");
    
    try {
      // First save the command to history
      await axios.post('/api/commands', {
        userId: 1,  // Fixed user ID
        command: inputText,
        status: "pending"
      });
      
      // First, check if it's a QBS command
      const command = inputText.toLowerCase();
      if (command.includes('inventory') || command.includes('check') || 
          command.includes('order') || command.includes('invoice') || command.includes('user list') ||
          command.includes('contact') || command.includes('contacts') || command.includes('supplier')) {
        
        // Get the connection information
        const connectionResponse = await axios.get('/api/connection/1');
        const connection = connectionResponse.data;
        console.log("Direct connection data:", connection);
        
        if (connection && connection.url) {
          // Handle inventory check
          if (command.includes('inventory') || command.includes('check')) {
            // Extract product name - very basic implementation
            let productName = "Plate"; // Default if none specified
            const productMatch = command.match(/for (\w+)/i);
            if (productMatch && productMatch[1]) {
              productName = productMatch[1];
            }
            
            // Make direct inventory API call
            const itemResponse = await axios.post('/api/erp/query', {
              userId: connection.userId,
              connectionId: connection.id,
              method: 'get_list',
              doctype: 'Item',
              filters: [["item_name", "like", `%${productName}%`]],
              fields: ["name", "item_name", "stock_uom"]
            });
            
            if (itemResponse.data.success && itemResponse.data.data && itemResponse.data.data.length > 0) {
              const item = itemResponse.data.data[0];
              
              // Now get inventory information for this item
              const binResponse = await axios.post('/api/erp/query', {
                userId: connection.userId,
                connectionId: connection.id,
                method: 'get_list',
                doctype: 'Bin',
                filters: [["item_code", "=", item.name]],
                fields: ["warehouse", "actual_qty", "item_code"]
              });
              
              if (binResponse.data.success) {
                const bins = binResponse.data.data || [];
                if (bins.length > 0) {
                  let totalQty = 0;
                  bins.forEach((bin: any) => {
                    totalQty += (bin.actual_qty || 0);
                  });
                  
                  setResult(`Product ${item.item_name} has ${totalQty} units in stock.`);
                } else {
                  setResult(`Product ${item.item_name} found but no inventory information available.`);
                }
              } else {
                setResult(`Error retrieving inventory for ${productName}: ${binResponse.data.message || 'Unknown error'}`);
              }
            } else {
              setResult(`No products found matching "${productName}".`);
            }
          } 
          // Handle orders
          else if (command.includes('order')) {
            const ordersResponse = await axios.post('/api/erp/query', {
              userId: connection.userId,
              connectionId: connection.id,
              method: 'get_list',
              doctype: 'Sales Order',
              filters: [["docstatus", "=", "1"], ["status", "not in", "Completed,Cancelled,Closed"]],
              fields: ["name", "customer", "grand_total", "status", "transaction_date"]
            });
            
            if (ordersResponse.data.success && ordersResponse.data.data) {
              const orders = ordersResponse.data.data;
              if (orders.length > 0) {
                setResult(`Found ${orders.length} open orders. The most recent is ${orders[0].name} for customer ${orders[0].customer}.`);
              } else {
                setResult("No open orders found.");
              }
            } else {
              setResult(`Error retrieving orders: ${ordersResponse.data.message || 'Unknown error'}`);
            }
          }
          // Handle user list command
          else if (command.includes('user list')) {
            try {
              console.log("Processing user list command");
              const usersResponse = await axios.post('/api/erp/query', {
                userId: connection.userId,
                connectionId: connection.id,
                method: 'get_list',
                doctype: 'User',
                filters: [],
                fields: ['name', 'full_name', 'email', 'enabled']
              });
              
              console.log("User list response:", usersResponse.data);
              
              if (usersResponse.data.success && usersResponse.data.data) {
                const users = usersResponse.data.data;
                if (users.length > 0) {
                  const userList = users.map((user: any) => 
                    `${user.full_name || user.name} (${user.email || 'No email'})`
                  ).join(', ');
                  
                  setResult(`Found ${users.length} users: ${userList}`);
                } else {
                  setResult("No users found.");
                }
              } else {
                setResult(`Error retrieving user list: ${usersResponse.data.message || 'Unknown error'}`);
              }
            } catch (error) {
              console.error("Error processing user list command:", error);
              setResult(`Error retrieving user list: ${(error as Error).message}`);
            }
          }
          // Handle contact list command
          else if (command.includes('contact') || command.includes('contacts')) {
            try {
              console.log("Processing contact list command");
              const contactsResponse = await axios.post('/api/erp/query', {
                userId: connection.userId,
                connectionId: connection.id,
                method: 'get_list',
                doctype: 'Contact',
                filters: [],
                fields: ['name', 'first_name', 'last_name', 'email_id', 'phone', 'mobile_no', 'is_primary_contact']
              });
              
              console.log("Contact list response:", contactsResponse.data);
              
              if (contactsResponse.data.success && contactsResponse.data.data) {
                const contacts = contactsResponse.data.data;
                if (contacts.length > 0) {
                  const contactList = contacts.map((contact: any) => {
                    const fullName = [contact.first_name, contact.last_name].filter(Boolean).join(' ');
                    return `${fullName || contact.name} (${contact.phone || contact.mobile_no || 'No phone'})`;
                  }).join(', ');
                  
                  setResult(`Found ${contacts.length} contacts: ${contactList}`);
                } else {
                  setResult("No contacts found.");
                }
              } else {
                setResult(`Error retrieving contact list: ${contactsResponse.data.message || 'Unknown error'}`);
              }
            } catch (error) {
              console.error("Error processing contact list command:", error);
              setResult(`Error retrieving contact list: ${(error as Error).message}`);
            }
          }
          // Handle supplier list command
          else if (command.includes('supplier')) {
            try {
              console.log("Processing supplier list command");
              const suppliersResponse = await axios.post('/api/erp/query', {
                userId: connection.userId,
                connectionId: connection.id,
                method: 'get_list',
                doctype: 'Supplier',
                filters: [],
                fields: ['name', 'supplier_name', 'supplier_group', 'country', 'supplier_type']
              });
              
              console.log("Supplier list response:", suppliersResponse.data);
              
              if (suppliersResponse.data.success && suppliersResponse.data.data) {
                const suppliers = suppliersResponse.data.data;
                if (suppliers.length > 0) {
                  const supplierList = suppliers.map((supplier: any) => 
                    `${supplier.supplier_name || supplier.name} (${supplier.supplier_group || 'No group'})`
                  ).join(', ');
                  
                  setResult(`Found ${suppliers.length} suppliers: ${supplierList}`);
                } else {
                  setResult("No suppliers found.");
                }
              } else {
                setResult(`Error retrieving supplier list: ${suppliersResponse.data.message || 'Unknown error'}`);
              }
            } catch (error) {
              console.error("Error processing supplier list command:", error);
              setResult(`Error retrieving supplier list: ${(error as Error).message}`);
            }
          }
          // Default response
          else {
            setResult(`Processing QBS command: "${inputText}"`);
          }
        } else {
          setResult("No valid QBS connection found. Please configure your connection in settings.");
        }
      } 
      // Non-QBS command
      else {
        setResult(`Processed command: "${inputText}"`);
      }
      
      // Save the command result
      await axios.post('/api/commands', {
        userId: 1,
        command: inputText,
        response: result,
        status: "success"
      });
      
      // Prepare speech text - clean it up for better speech synthesis
      const speechText = result;
      
      // Speak the result if speech is enabled
      if (isSpeechEnabled && speechSynthesisRef.current && !isSpeaking) {
        try {
          const utterance = new SpeechSynthesisUtterance(speechText);
          utterance.rate = 0.95;
          utterance.pitch = 0.9;
          utterance.volume = 0.85;
          
          // Try to find a different, more natural voice - not the default one
          if (speechSynthesisRef.current) {
            const voices = speechSynthesisRef.current.getVoices();
            // Look for English female voices first as they tend to sound more natural
            const femaleVoice = voices.find(voice => 
              voice.name.includes('female') || 
              voice.name.includes('Samantha') || 
              voice.name.includes('Zira') || 
              voice.name.includes('Karen'));
              
            if (femaleVoice) {
              utterance.voice = femaleVoice;
            } else {
              // If no specific female voice, try another non-default voice
              const alternativeVoice = voices.find(voice => !voice.default);
              if (alternativeVoice) {
                utterance.voice = alternativeVoice;
              }
            }
          }
          
          // Add event handlers
          utterance.onstart = () => {
            setIsSpeaking(true);
            console.log("Speech synthesis started");
          };
          
          utterance.onend = () => {
            setIsSpeaking(false);
            console.log("Speech synthesis ended");
          };
          
          utterance.onerror = (event) => {
            console.error("Speech synthesis error:", event);
            setIsSpeaking(false);
          };
          
          // Speak the text
          speechSynthesisRef.current.speak(utterance);
        } catch (error) {
          console.error("Error speaking:", error);
        }
      }
      
      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing command:", error);
      setResult(`Error processing command: ${(error as Error).message}`);
      setIsProcessing(false);
      
      // Save the error
      await axios.post('/api/commands', {
        userId: 1,
        command: inputText,
        response: `Error: ${(error as Error).message}`,
        status: "error"
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 border-b">
        <h2 className="font-semibold text-xl text-center text-white">QBS Voice Assistant</h2>
        
        <div className="flex items-center justify-center mt-2">
          <span className={`inline-block w-4 h-4 rounded-full mr-2 ${
            isProcessing ? 'bg-yellow-300 animate-pulse' : 
            isRecording ? 'bg-red-400 animate-pulse' : 
            'bg-green-300'
          }`}></span>
          <span className="text-sm font-medium text-white">
            {isProcessing ? "Processing..." : 
             isRecording ? "Listening..." : 
             "Ready for command"}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        {/* Browser compatibility notice */}
        <div className="mb-5 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <h3 className="text-sm font-medium text-amber-800 mb-1">📣 Voice Recognition Requirements:</h3>
          <ul className="text-xs text-amber-700 list-disc pl-5 space-y-1">
            <li>Use <b>Chrome</b> or <b>Edge</b> browser for best compatibility</li>
            <li>Allow <b>microphone permissions</b> when prompted</li>
            <li>Share your command after clicking "Start Listening"</li>
            <li>If voice doesn't work, you can always <b>type commands</b> directly</li>
          </ul>
        </div>
      
        {/* Command suggestions */}
        <div className="mb-5">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Try these commands:</h3>
          <div className="flex flex-wrap gap-2">
            <span 
              className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-100"
              onClick={() => {
                setInputText("user list");
                processCommand();
              }}
            >
              user list
            </span>
            <span 
              className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-100"
              onClick={() => {
                setInputText("check inventory for Plate");
                processCommand();
              }}
            >
              check inventory for Plate
            </span>
            <span 
              className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-100"
              onClick={() => {
                setInputText("show orders");
                processCommand();
              }}
            >
              show orders
            </span>
            <span 
              className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-100"
              onClick={() => {
                setInputText("show contact list");
                processCommand();
              }}
            >
              contact list
            </span>
            <span 
              className="inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium cursor-pointer hover:bg-blue-100"
              onClick={() => {
                setInputText("show supplier list");
                processCommand();
              }}
            >
              supplier list
            </span>
          </div>
        </div>
      
        {/* Command input field */}
        <div className="mb-5">
          <div className="flex items-center border-2 border-blue-200 rounded-lg overflow-hidden shadow-sm focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
            <span className="bg-blue-50 p-3 border-r border-blue-200">
              <Server className="h-5 w-5 text-blue-500" />
            </span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your command or click on microphone..."
              className="w-full p-3 focus:outline-none bg-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputText.trim()) {
                  processCommand();
                }
              }}
            />
          </div>
          
          {/* Speech recognition feedback */}
          {isRecording && (
            <div className="mt-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-100 text-sm">
              <p className="font-medium text-blue-700 mb-1">Listening...</p>
              <p className="text-blue-600 italic">{transcript ? `"${transcript}"` : "Waiting for your command..."}</p>
            </div>
          )}
        </div>
        
        {/* Voice control buttons */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-lg shadow-md transition-all hover:shadow-lg"
            onClick={startRecording}
            disabled={isRecording || isProcessing}
          >
            <Mic className="mr-2 h-5 w-5" />
            Start Listening
          </Button>
          
          <Button 
            className="bg-red-500 hover:bg-red-600 text-white py-6 rounded-lg shadow-md transition-all hover:shadow-lg"
            onClick={stopRecording}
            disabled={!isRecording || isProcessing}
          >
            <Square className="mr-2 h-5 w-5" />
            Stop Listening
          </Button>
          
          <Button 
            className="bg-green-500 hover:bg-green-600 text-white py-6 rounded-lg shadow-md transition-all hover:shadow-lg"
            onClick={processCommand}
            disabled={!inputText.trim() || isProcessing}
          >
            <Check className="mr-2 h-5 w-5" />
            Process Command
          </Button>
        </div>
        
        {/* Result display with animation */}
        <div className={`mt-5 transition-all duration-300 ${result || isProcessing ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'}`}>
          <Card className="overflow-hidden border-2 border-blue-100 shadow-md">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <h3 className="font-medium text-blue-800 mr-3">Response</h3>
                  <button 
                    className="flex items-center text-sm text-gray-600 hover:text-blue-700"
                    onClick={() => setIsSpeechEnabled(!isSpeechEnabled)}
                    title={isSpeechEnabled ? "Disable voice responses" : "Enable voice responses"}
                  >
                    {isSpeechEnabled ? (
                      <Volume2 className="h-4 w-4 text-green-600" />
                    ) : (
                      <VolumeX className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="ml-1 text-xs">{isSpeechEnabled ? "Speech On" : "Speech Off"}</span>
                  </button>
                  {isSpeaking && (
                    <span className="ml-2 text-xs text-blue-500 animate-pulse">Speaking...</span>
                  )}
                </div>
                {isProcessing && (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                )}
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 text-gray-700 min-h-[100px] flex items-center justify-center">
                {isProcessing ? (
                  <span className="text-blue-500 font-medium">Processing your command...</span>
                ) : (
                  <div className="w-full">
                    <p className="font-medium text-indigo-900 mb-2">Command Result:</p>
                    <p>{result}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SimpleControls;